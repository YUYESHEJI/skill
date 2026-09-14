#!/usr/bin/env python3
"""Local-only credential storage for Codex Tian Image skill."""
from __future__ import annotations

import argparse
import ctypes
import getpass
import os
from pathlib import Path
import secrets
import sys
import tempfile

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass

KEY_NAME = "TIAN_IMAGE_API_KEY"
MAX_KEY_BYTES = 16 * 1024
WINDOWS_HEADER = b"TIAN-IMAGE-DPAPI-V1\0"
POSIX_HEADER = b"TIAN-IMAGE-LOCAL-V1\n"


class SetupError(RuntimeError):
    pass


def is_valid_key(value: str) -> bool:
    return 8 <= len(value) <= 512 and value.startswith("sk-") and all(
        char.isascii() and (char.isalnum() or char in "._~+/=-") for char in value
    )


def _credential_path() -> Path:
    if os.name == "nt":
        base = os.environ.get("LOCALAPPDATA", "").strip()
        root = Path(base) if base else Path.home() / "AppData/Local"
    else:
        base = os.environ.get("XDG_CONFIG_HOME", "").strip()
        root = Path(base) if base else Path.home() / ".config"
    return root / "TianImage" / "image-api-key.bin"


def _previous_path() -> Path:
    return _credential_path().with_name("image-api-key.previous.bin")


def _dpapi(data: bytes, protect: bool) -> bytes:
    from ctypes import wintypes
    class Blob(ctypes.Structure):
        _fields_ = [("size", wintypes.DWORD), ("data", ctypes.POINTER(ctypes.c_ubyte))]
    source_buffer = (ctypes.c_ubyte * len(data)).from_buffer_copy(data)
    source = Blob(len(data), ctypes.cast(source_buffer, ctypes.POINTER(ctypes.c_ubyte)))
    destination = Blob()
    description = wintypes.LPWSTR()
    crypt32 = ctypes.WinDLL("Crypt32.dll", use_last_error=True)
    kernel32 = ctypes.WinDLL("Kernel32.dll", use_last_error=True)
    crypt32.CryptProtectData.argtypes = [ctypes.POINTER(Blob), wintypes.LPCWSTR, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, wintypes.DWORD, ctypes.POINTER(Blob)]
    crypt32.CryptUnprotectData.argtypes = [ctypes.POINTER(Blob), ctypes.POINTER(wintypes.LPWSTR), ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, wintypes.DWORD, ctypes.POINTER(Blob)]
    crypt32.CryptProtectData.restype = wintypes.BOOL
    crypt32.CryptUnprotectData.restype = wintypes.BOOL
    kernel32.LocalFree.argtypes = [wintypes.HLOCAL]
    kernel32.LocalFree.restype = wintypes.HLOCAL
    if protect:
        ok = crypt32.CryptProtectData(ctypes.byref(source), "Tian Image key", None, None, None, 1, ctypes.byref(destination))
    else:
        ok = crypt32.CryptUnprotectData(ctypes.byref(source), ctypes.byref(description), None, None, None, 1, ctypes.byref(destination))
    if not ok:
        raise OSError(ctypes.get_last_error(), "DPAPI operation failed")
    try:
        return ctypes.string_at(destination.data, destination.size)
    finally:
        if destination.data:
            kernel32.LocalFree(ctypes.cast(destination.data, wintypes.HLOCAL))
        if description:
            kernel32.LocalFree(ctypes.cast(description, wintypes.HLOCAL))


def _read(path: Path) -> str | None:
    try:
        if not path.is_file() or path.stat().st_size > MAX_KEY_BYTES:
            return None
        payload = path.read_bytes()
        if os.name == "nt":
            if not payload.startswith(WINDOWS_HEADER):
                return None
            clear = _dpapi(payload[len(WINDOWS_HEADER):], False)
        else:
            if path.stat().st_mode & 0o077 or not payload.startswith(POSIX_HEADER):
                return None
            clear = payload[len(POSIX_HEADER):]
        value = clear.decode("utf-8").strip()
        return value if is_valid_key(value) else None
    except (OSError, UnicodeError, ValueError):
        return None


def get_saved_api_key() -> str | None:
    local = _read(_credential_path())
    if local:
        return local
    legacy = os.environ.get(KEY_NAME, "").strip()
    return legacy if is_valid_key(legacy) else None


def _write(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if os.name != "nt":
        os.chmod(path.parent, 0o700)
    with tempfile.NamedTemporaryFile(mode="wb", dir=path.parent, delete=False) as stream:
        temporary = Path(stream.name)
        stream.write(payload)
        stream.flush()
        os.fsync(stream.fileno())
    os.chmod(temporary, 0o600)
    os.replace(temporary, path)


def persist_api_key(value: str) -> None:
    if not is_valid_key(value):
        raise SetupError("密钥格式不正确：必须以 sk- 开头。")
    path = _credential_path()
    old_payload = path.read_bytes() if _read(path) else None
    if old_payload:
        _write(_previous_path(), old_payload)
    clear = value.encode("utf-8")
    try:
        payload = WINDOWS_HEADER + _dpapi(clear, True) if os.name == "nt" else POSIX_HEADER + clear
        _write(path, payload)
    except OSError as exc:
        raise SetupError("当前用户的本机加密保存失败；未改用明文，也未申请管理员权限。") from exc
    saved = _read(path)
    if not saved or not secrets.compare_digest(saved, value):
        raise SetupError("本机密钥保存后校验失败。")


def configure_key_from_stdin(force: bool = False) -> str:
    existing = get_saved_api_key()
    if existing and not force:
        return existing
    value = (getpass.getpass("请粘贴生图密钥（输入不会显示）：") if sys.stdin.isatty() else sys.stdin.readline(MAX_KEY_BYTES + 1)).strip()
    if len(value) > MAX_KEY_BYTES:
        raise SetupError("密钥内容过长，未保存。")
    persist_api_key(value)
    return value


def restore_previous_api_key() -> None:
    previous = _read(_previous_path())
    if not previous:
        raise SetupError("没有可恢复的上一份本机加密密钥。")
    persist_api_key(previous)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stdin", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--restore-previous", action="store_true")
    args = parser.parse_args(argv)
    try:
        if args.restore_previous:
            restore_previous_api_key()
        elif args.stdin:
            configure_key_from_stdin(args.force)
        else:
            raise SetupError("请使用 --stdin，由 Codex 通过标准输入保存密钥。")
        print("本机加密凭据已更新；未显示密钥内容。")
        return 0
    except SetupError as exc:
        print(f"配置失败：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
