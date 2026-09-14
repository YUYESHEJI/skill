#!/usr/bin/env python3
"""Generate or edit images through Tian Image's gpt-image-2 API."""

from __future__ import annotations

import argparse
import base64
import binascii
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import importlib
import ipaddress
import json
import math
import os
from pathlib import Path
import socket
import struct
import subprocess
import sys
import tempfile
import time
from typing import Any, Iterable, Optional, Sequence
from urllib.parse import urljoin, urlparse
from uuid import uuid4
try:
    import venv
except ModuleNotFoundError:  # The Windows embeddable runtime omits venv.
    venv = None
import zlib


def _force_utf8_streams() -> None:
    """Emit UTF-8 even when Git Bash/Python inherits the Windows CP936 locale."""
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, OSError):
            pass


_force_utf8_streams()


SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))


GENERATIONS_URL = "https://tian.yituohub.com/v1/images/generations"
EDITS_URL = "https://tian.yituohub.com/v1/images/edits"
MODEL = "gpt-image-2"
KEY_NAME = "TIAN_IMAGE_API_KEY"
OUTPUT_DIR = Path.home() / "tian_image_output"
RUNTIME_DIR = Path.home() / ".tian-image-runtime"
WHEEL_DIR = Path(__file__).resolve().parent.parent / "vendor" / "wheels"
PYPI_MIRROR = "https://pypi.tuna.tsinghua.edu.cn/simple"
ALLOWED_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_SIZES = ("1024x1024", "1536x1024", "1024x1536", "auto")
ALLOWED_QUALITIES = ("low", "medium", "high", "auto")
ALLOWED_OUTPUT_FORMATS = ("png", "jpeg", "webp")
REQUEST_TIMEOUT_SECONDS = 300
MAX_RETRY_AFTER_SECONDS = 300
MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024
MAX_API_RESPONSE_BYTES = 200 * 1024 * 1024
MAX_TOTAL_OUTPUT_BYTES = 200 * 1024 * 1024
MAX_IMAGE_COUNT = 10
MAX_EDIT_INPUT_BYTES = 200 * 1024 * 1024
MAX_DIMENSION = 32768
MAX_PIXELS = 100_000_000
MAX_DECOMPRESSED_IMAGE_BYTES = 128 * 1024 * 1024
MAX_REDIRECTS = 4
AUTH_ERROR_MESSAGE = (
    "生图 key 无效、未选择 gpt-image-2 分组或额度不足。"
    "请确认使用的是 Tian Image 新建的生图密钥，而不是普通对话分组的 key。"
)


class FriendlyError(RuntimeError):
    """An error message safe to show directly to a non-technical user."""


def _subprocess_flags() -> int:
    return getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0


def _run_quiet(
    command: list[str], timeout: int = 600
) -> subprocess.CompletedProcess[str]:
    child_environment = os.environ.copy()
    child_environment.pop(KEY_NAME, None)
    return subprocess.run(
        command,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        check=False,
        creationflags=_subprocess_flags(),
        env=child_environment,
    )


def _venv_python(venv_dir: Path) -> Path:
    return venv_dir / ("Scripts/python.exe" if os.name == "nt" else "bin/python")


def _pip_commands(python_executable: str, *, user: bool) -> list[list[str]]:
    base = [
        python_executable,
        "-m",
        "pip",
        "install",
        "--disable-pip-version-check",
    ]
    user_flag = ["--user"] if user else []
    commands = []
    if WHEEL_DIR.is_dir():
        commands.append(
            [
                *base,
                *user_flag,
                "--no-index",
                "--find-links",
                str(WHEEL_DIR),
                "requests",
            ]
        )
    return [
        *commands,
        [*base, *user_flag, "requests"],
        [*base, *user_flag, "--index-url", PYPI_MIRROR, "requests"],
    ]


def ensure_requests() -> Any:
    """Import requests, repairing the runtime automatically when necessary."""
    try:
        return importlib.import_module("requests")
    except ModuleNotFoundError as exc:
        if exc.name != "requests":
            raise FriendlyError(f"requests 的依赖不完整：{exc.name}") from exc

    print("未检测到 requests，正在自动安装运行依赖……", file=sys.stderr)
    current_is_venv = sys.prefix != getattr(sys, "base_prefix", sys.prefix)
    last_error = ""
    for command in _pip_commands(sys.executable, user=not current_is_venv):
        try:
            result = _run_quiet(command)
        except (OSError, subprocess.SubprocessError) as exc:
            last_error = str(exc)
            continue
        if result.returncode == 0:
            importlib.invalidate_caches()
            try:
                if not current_is_venv:
                    import site

                    site.addsitedir(site.getusersitepackages())
                return importlib.import_module("requests")
            except ModuleNotFoundError:
                pass
        last_error = (result.stderr or result.stdout)[-500:]

    if venv is None:
        raise FriendlyError(
            "当前 Python 运行时没有 venv，且内置依赖不可用。请重新安装完整安装包。"
        )
    venv_dir = RUNTIME_DIR / "venv"
    try:
        venv_dir.parent.mkdir(parents=True, exist_ok=True)
        venv.EnvBuilder(with_pip=True, clear=False).create(venv_dir)
        runtime_python = _venv_python(venv_dir)
        for command in _pip_commands(str(runtime_python), user=False):
            result = _run_quiet(command)
            if result.returncode == 0:
                os.execv(
                    str(runtime_python),
                    [str(runtime_python), str(Path(__file__).resolve()), *sys.argv[1:]],
                )
            last_error = (result.stderr or result.stdout)[-500:]
    except (OSError, subprocess.SubprocessError) as exc:
        last_error = str(exc)

    detail = sanitize_error(last_error) if last_error else "未获得安装器详情"
    raise FriendlyError(
        "requests 自动安装失败。已尝试用户级安装、独立虚拟环境和可信镜像。"
        f"请检查网络或 Python 安装后重试。详情：{detail}"
    )


def _setup_module() -> Any:
    try:
        return importlib.import_module("setup_key")
    except (ImportError, OSError) as exc:
        raise FriendlyError("密钥配置组件缺失或损坏，请重新安装本 skill。") from exc


def ensure_api_key() -> str:
    setup = _setup_module()
    key = setup.get_saved_api_key()
    if key:
        return key
    raise FriendlyError(
        "未检测到生图密钥。请把密钥发送给当前 Codex，"
        "再由 Codex 通过 setup 标准输入安全保存；不要写入命令行或环境变量。"
    )


def positive_count(value: str) -> int:
    try:
        parsed = int(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("必须是整数") from exc
    if not 1 <= parsed <= 10:
        raise argparse.ArgumentTypeError("必须在 1 到 10 之间")
    return parsed


def non_empty_prompt(value: str) -> str:
    if not value.strip():
        raise argparse.ArgumentTypeError("不能为空")
    if len(value) > 32768:
        raise argparse.ArgumentTypeError("不能超过 32768 个字符")
    return value


def _valid_png(data: bytes) -> bool:
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        return False
    position = 8
    seen_header = False
    seen_data = False
    width = height = bit_depth = color_type = interlace = 0
    compressed_parts: list[bytes] = []
    while position + 12 <= len(data):
        length = int.from_bytes(data[position : position + 4], "big")
        chunk_type = data[position + 4 : position + 8]
        chunk_end = position + 12 + length
        if length > MAX_DOWNLOAD_BYTES or chunk_end > len(data):
            return False
        chunk_data = data[position + 8 : position + 8 + length]
        stored_crc = int.from_bytes(data[position + 8 + length : chunk_end], "big")
        if zlib.crc32(chunk_type + chunk_data) & 0xFFFFFFFF != stored_crc:
            return False
        if not seen_header:
            if chunk_type != b"IHDR" or length != 13:
                return False
            width, height = struct.unpack(">II", chunk_data[:8])
            bit_depth = chunk_data[8]
            color_type = chunk_data[9]
            compression = chunk_data[10]
            filtering = chunk_data[11]
            interlace = chunk_data[12]
            valid_depths = {
                0: {1, 2, 4, 8, 16},
                2: {8, 16},
                3: {1, 2, 4, 8},
                4: {8, 16},
                6: {8, 16},
            }
            if (
                width == 0
                or height == 0
                or width > MAX_DIMENSION
                or height > MAX_DIMENSION
                or width * height > MAX_PIXELS
                or bit_depth not in valid_depths.get(color_type, set())
                or compression != 0
                or filtering != 0
                or interlace not in (0, 1)
            ):
                return False
            seen_header = True
        elif chunk_type == b"IHDR":
            return False
        if chunk_type == b"IDAT":
            seen_data = True
            compressed_parts.append(chunk_data)
        if chunk_type == b"IEND":
            if not (
                length == 0 and seen_header and seen_data and chunk_end == len(data)
            ):
                return False
            channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color_type]
            bits_per_pixel = channels * bit_depth
            if interlace == 0:
                expected = (((width * bits_per_pixel + 7) // 8) + 1) * height
            else:
                expected = 0
                for start_x, start_y, step_x, step_y in (
                    (0, 0, 8, 8),
                    (4, 0, 8, 8),
                    (0, 4, 4, 8),
                    (2, 0, 4, 4),
                    (0, 2, 2, 4),
                    (1, 0, 2, 2),
                    (0, 1, 1, 2),
                ):
                    pass_width = max(0, (width - start_x + step_x - 1) // step_x)
                    pass_height = max(
                        0, (height - start_y + step_y - 1) // step_y
                    )
                    if pass_width and pass_height:
                        row_bytes = (pass_width * bits_per_pixel + 7) // 8
                        expected += (row_bytes + 1) * pass_height
            if expected <= 0 or expected > MAX_DECOMPRESSED_IMAGE_BYTES:
                return False
            try:
                decompressor = zlib.decompressobj()
                raw = decompressor.decompress(
                    b"".join(compressed_parts), expected + 1
                )
                if decompressor.unconsumed_tail or len(raw) > expected:
                    return False
                raw += decompressor.flush()
            except zlib.error:
                return False
            return decompressor.eof and len(raw) == expected
        position = chunk_end
    return False


def _valid_jpeg(data: bytes) -> bool:
    if len(data) < 12 or not data.startswith(b"\xff\xd8") or not data.endswith(
        b"\xff\xd9"
    ):
        return False
    position = 2
    seen_frame = False
    start_of_frame = {
        0xC0,
        0xC1,
        0xC2,
        0xC3,
        0xC5,
        0xC6,
        0xC7,
        0xC9,
        0xCA,
        0xCB,
        0xCD,
        0xCE,
        0xCF,
    }
    while position < len(data) - 2:
        if data[position] != 0xFF:
            return False
        while position < len(data) and data[position] == 0xFF:
            position += 1
        if position >= len(data):
            return False
        marker = data[position]
        position += 1
        if marker == 0xD9:
            return seen_frame
        if marker == 0x00 or marker == 0x01 or 0xD0 <= marker <= 0xD7:
            continue
        if position + 2 > len(data):
            return False
        segment_length = int.from_bytes(data[position : position + 2], "big")
        segment_end = position + segment_length
        if segment_length < 2 or segment_end > len(data):
            return False
        if marker in start_of_frame:
            if segment_length < 8:
                return False
            height = int.from_bytes(data[position + 3 : position + 5], "big")
            width = int.from_bytes(data[position + 5 : position + 7], "big")
            if (
                width == 0
                or height == 0
                or width > MAX_DIMENSION
                or height > MAX_DIMENSION
                or width * height > MAX_PIXELS
            ):
                return False
            seen_frame = True
        if marker == 0xDA:
            return seen_frame
        position = segment_end
    return False


def _valid_webp(data: bytes) -> bool:
    if (
        len(data) < 20
        or data[:4] != b"RIFF"
        or data[8:12] != b"WEBP"
        or int.from_bytes(data[4:8], "little") + 8 != len(data)
    ):
        return False
    position = 12
    seen_image = False
    valid_extended_header = False
    while position + 8 <= len(data):
        chunk_type = data[position : position + 4]
        chunk_length = int.from_bytes(data[position + 4 : position + 8], "little")
        chunk_start = position + 8
        chunk_end = chunk_start + chunk_length
        padded_end = chunk_end + (chunk_length % 2)
        if chunk_length > MAX_DOWNLOAD_BYTES or padded_end > len(data):
            return False
        payload = data[chunk_start:chunk_end]
        if chunk_type == b"VP8X":
            if len(payload) < 10:
                return False
            width = int.from_bytes(payload[4:7], "little") + 1
            height = int.from_bytes(payload[7:10], "little") + 1
            valid_extended_header = (
                0 < width <= MAX_DIMENSION
                and 0 < height <= MAX_DIMENSION
                and width * height <= MAX_PIXELS
            )
        elif chunk_type == b"VP8L":
            if len(payload) >= 5 and payload[0] == 0x2F:
                width = 1 + payload[1] + ((payload[2] & 0x3F) << 8)
                height = 1 + (payload[2] >> 6) + (payload[3] << 2) + (
                    (payload[4] & 0x0F) << 10
                )
                seen_image = (
                    width <= MAX_DIMENSION
                    and height <= MAX_DIMENSION
                    and width * height <= MAX_PIXELS
                )
        elif chunk_type == b"VP8 ":
            if len(payload) >= 10 and payload[3:6] == b"\x9d\x01\x2a":
                width = int.from_bytes(payload[6:8], "little") & 0x3FFF
                height = int.from_bytes(payload[8:10], "little") & 0x3FFF
                seen_image = (
                    0 < width <= MAX_DIMENSION
                    and 0 < height <= MAX_DIMENSION
                    and width * height <= MAX_PIXELS
                )
        elif chunk_type == b"ANMF":
            seen_image = valid_extended_header and len(payload) >= 16
        position = padded_end
    return seen_image and position == len(data)


def _verified_image_format(data: bytes) -> Optional[str]:
    if _valid_png(data):
        return "png"
    if _valid_jpeg(data):
        return "jpeg"
    if _valid_webp(data):
        return "webp"
    return None


def validate_image_file(
    path_value: str, allowed_suffixes: Iterable[str], label: str
) -> Path:
    path = Path(path_value).expanduser().resolve()
    if not path.is_file():
        raise FriendlyError(f"{label}不存在或不是文件：{path}")
    allowed = set(allowed_suffixes)
    if path.suffix.lower() not in allowed:
        expected = "/".join(sorted(suffix.lstrip(".") for suffix in allowed))
        raise FriendlyError(f"{label}格式不支持：{path}；仅支持 {expected}")
    try:
        if path.stat().st_size > MAX_DOWNLOAD_BYTES:
            raise FriendlyError(f"{label}超过 50 MB 大小限制：{path}")
        with path.open("rb") as stream:
            detected = _verified_image_format(stream.read(MAX_DOWNLOAD_BYTES + 1))
    except OSError as exc:
        raise FriendlyError(f"无法读取{label}：{path}") from exc
    expected_by_suffix = {
        ".png": "png",
        ".jpg": "jpeg",
        ".jpeg": "jpeg",
        ".webp": "webp",
    }
    if detected != expected_by_suffix.get(path.suffix.lower()):
        raise FriendlyError(f"{label}扩展名与真实图片格式不一致：{path}")
    return path


def sanitize_error(value: str) -> str:
    text = re_sub_secret(value.strip())
    return text[:500] if text else "服务端未返回错误详情"


def re_sub_secret(value: str) -> str:
    import re

    value = re.sub(r"(?i)Bearer\s+[^\s\"']+", "Bearer [已隐藏]", value)
    return re.sub(r"sk-[A-Za-z0-9._~+/=-]{5,}", "sk-[已隐藏]", value)


def _read_bounded_response(response: Any, limit: int, label: str) -> bytes:
    content_length = response.headers.get("Content-Length")
    if content_length:
        try:
            if int(content_length) > limit:
                raise FriendlyError(f"{label}超过 {limit // (1024 * 1024)} MB 限制。")
        except ValueError:
            pass
    content = bytearray()
    try:
        for chunk in response.iter_content(chunk_size=64 * 1024):
            if not chunk:
                continue
            content.extend(chunk)
            if len(content) > limit:
                raise FriendlyError(
                    f"{label}超过 {limit // (1024 * 1024)} MB 限制。"
                )
    except FriendlyError:
        raise
    except Exception as exc:
        raise FriendlyError(f"读取{label}失败：{sanitize_error(str(exc))}") from exc
    return bytes(content)


def response_error_detail(response: Any) -> str:
    try:
        raw = _read_bounded_response(response, 64 * 1024, "错误响应")
    except FriendlyError:
        return "服务端错误详情过大，已停止读取"
    text = raw.decode("utf-8", errors="replace")
    try:
        payload = json.loads(text)
    except (ValueError, TypeError):
        return sanitize_error(text)
    if isinstance(payload, dict):
        error = payload.get("error")
        if isinstance(error, dict):
            detail = error.get("message") or error.get("code")
            if detail:
                return sanitize_error(str(detail))
        if error:
            return sanitize_error(str(error))
        detail = payload.get("message") or payload.get("detail")
        if detail:
            return sanitize_error(str(detail))
    return sanitize_error(json.dumps(payload, ensure_ascii=False))


def retry_delay(response: Any) -> float:
    raw = response.headers.get("Retry-After", "").strip()
    if not raw:
        return 2.0
    try:
        delay = float(raw)
    except ValueError:
        try:
            target = parsedate_to_datetime(raw)
            if target.tzinfo is None:
                target = target.replace(tzinfo=timezone.utc)
            delay = (target - datetime.now(timezone.utc)).total_seconds()
        except (TypeError, ValueError, OverflowError):
            delay = 2.0
    if not math.isfinite(delay):
        delay = 2.0
    return min(max(delay, 0.0), MAX_RETRY_AFTER_SECONDS)


def check_api_response(response: Any) -> None:
    if response.status_code in (401, 403):
        raise FriendlyError(AUTH_ERROR_MESSAGE)
    if 300 <= response.status_code < 400:
        raise FriendlyError("Tian Image 接口返回了重定向，已为保护密钥停止请求。")
    if not response.ok:
        raise FriendlyError(
            f"Tian Image 接口请求失败（HTTP {response.status_code}）："
            f"{response_error_detail(response)}"
        )


def post_with_one_retry(
    requests: Any,
    url: str,
    headers: dict[str, str],
    *,
    json_payload: Optional[dict[str, Any]] = None,
    data: Optional[dict[str, str]] = None,
    files: Optional[list[tuple[str, tuple[str, Any, str]]]] = None,
) -> Any:
    for attempt in range(2):
        if files:
            for _, file_info in files:
                file_object = file_info[1]
                if hasattr(file_object, "seek"):
                    file_object.seek(0)
        try:
            response = requests.post(
                url,
                headers=headers,
                json=json_payload,
                data=data,
                files=files,
                timeout=REQUEST_TIMEOUT_SECONDS,
                allow_redirects=False,
                stream=True,
            )
        except requests.RequestException as exc:
            raise FriendlyError(f"无法连接 Tian Image：{sanitize_error(str(exc))}") from exc
        if response.status_code != 429 or attempt == 1:
            try:
                check_api_response(response)
            except FriendlyError:
                response.close()
                raise
            return response
        delay = retry_delay(response)
        response.close()
        print(f"请求过于频繁，{delay:g} 秒后自动重试一次……", file=sys.stderr)
        time.sleep(delay)
    raise FriendlyError("Tian Image 请求失败。")


def response_items(response: Any) -> list[dict[str, Any]]:
    try:
        raw = _read_bounded_response(
            response, MAX_API_RESPONSE_BYTES, "Tian Image 接口响应"
        )
        payload = json.loads(raw.decode("utf-8-sig"))
    except (ValueError, UnicodeError) as exc:
        raise FriendlyError("Tian Image 返回的不是有效 JSON。") from exc
    if not isinstance(payload, dict) or not isinstance(payload.get("data"), list):
        raise FriendlyError("Tian Image 返回格式异常：缺少 data 数组。")
    items = [item for item in payload["data"] if isinstance(item, dict)]
    if not items:
        raise FriendlyError("Tian Image 没有返回任何图片数据。")
    if len(items) > MAX_IMAGE_COUNT:
        raise FriendlyError(f"Tian Image 返回图片数量超过 {MAX_IMAGE_COUNT} 张限制。")
    return items


def _assert_public_https(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme.lower() != "https" or not parsed.hostname:
        raise FriendlyError("Tian Image 返回了不安全或无效的临时图片 URL。")
    try:
        addresses = {
            entry[4][0]
            for entry in socket.getaddrinfo(
                parsed.hostname,
                parsed.port or 443,
                type=socket.SOCK_STREAM,
            )
        }
    except (socket.gaierror, ValueError) as exc:
        raise FriendlyError("无法解析临时图片下载地址。") from exc
    for address in addresses:
        ip = ipaddress.ip_address(address.split("%", 1)[0])
        if not ip.is_global:
            raise FriendlyError("临时图片 URL 指向本机或私有网络，已拒绝下载。")


def _download_once(requests: Any, url: str) -> Any:
    try:
        return requests.get(
            url,
            timeout=REQUEST_TIMEOUT_SECONDS,
            stream=True,
            allow_redirects=False,
        )
    except requests.RequestException as exc:
        raise FriendlyError(f"下载生成图片失败：{sanitize_error(str(exc))}") from exc


def download_image(requests: Any, url: str) -> bytes:
    current = url
    redirects = 0
    retried_429 = False
    while True:
        _assert_public_https(current)
        response = _download_once(requests, current)
        if response.status_code == 429 and not retried_429:
            retried_429 = True
            delay = retry_delay(response)
            response.close()
            print(f"下载请求过于频繁，{delay:g} 秒后自动重试一次……", file=sys.stderr)
            time.sleep(delay)
            continue
        if response.status_code in (301, 302, 303, 307, 308):
            location = response.headers.get("Location", "")
            response.close()
            if not location or redirects >= MAX_REDIRECTS:
                raise FriendlyError("临时图片 URL 重定向异常。")
            current = urljoin(current, location)
            redirects += 1
            continue
        if not response.ok:
            detail = response_error_detail(response)
            status = response.status_code
            response.close()
            raise FriendlyError(f"下载生成图片失败（HTTP {status}）：{detail}")
        content_length = response.headers.get("Content-Length")
        if content_length:
            try:
                if int(content_length) > MAX_DOWNLOAD_BYTES:
                    response.close()
                    raise FriendlyError("生成图片超过 50 MB 安全限制。")
            except ValueError:
                pass
        chunks = bytearray()
        try:
            for chunk in response.iter_content(chunk_size=64 * 1024):
                if not chunk:
                    continue
                chunks.extend(chunk)
                if len(chunks) > MAX_DOWNLOAD_BYTES:
                    raise FriendlyError("生成图片超过 50 MB 安全限制。")
        finally:
            response.close()
        return bytes(chunks)


def _expected_format(output_format: str) -> str:
    return "jpeg" if output_format == "jpeg" else output_format


def _suffix(output_format: str) -> str:
    return ".jpg" if output_format == "jpeg" else f".{output_format}"


def _decode_b64(value: str) -> bytes:
    if value.startswith("data:") and "," in value:
        value = value.split(",", 1)[1]
    if len(value) > (MAX_DOWNLOAD_BYTES * 4 // 3) + 8:
        raise FriendlyError("Tian Image 返回的 Base64 图片超过 50 MB 限制。")
    try:
        decoded = base64.b64decode(value, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise FriendlyError("Tian Image 返回的 b64_json 不是有效 Base64。") from exc
    if len(decoded) > MAX_DOWNLOAD_BYTES:
        raise FriendlyError("Tian Image 返回的图片超过 50 MB 限制。")
    return decoded


def _write_image(data: bytes, destination: Path, output_format: str) -> None:
    detected = _verified_image_format(data)
    if detected is None:
        raise FriendlyError("Tian Image 返回的内容不是真实图片。")
    if detected != _expected_format(output_format):
        raise FriendlyError(
            f"Tian Image 返回了 {detected}，与请求的 {output_format} 格式不一致。"
        )
    temporary: Optional[Path] = None
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            mode="wb",
            prefix=f".{destination.name}.",
            suffix=".part",
            dir=destination.parent,
            delete=False,
        ) as stream:
            temporary = Path(stream.name)
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, destination)
    except OSError as exc:
        if temporary is not None:
            try:
                temporary.unlink(missing_ok=True)
            except OSError:
                pass
        raise FriendlyError(f"无法保存生成图片：{destination}") from exc


def save_images(
    requests: Any,
    items: Sequence[dict[str, Any]],
    output_format: str,
    output_dir: Path,
) -> list[Path]:
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    saved: list[Path] = []
    total_bytes = 0
    for index, item in enumerate(items, start=1):
        destination = (
            output_dir
            / f"tian-image-{timestamp}-{index}-{uuid4().hex[:8]}{_suffix(output_format)}"
        ).resolve()
        b64_json = item.get("b64_json")
        url = item.get("url")
        if isinstance(b64_json, str) and b64_json:
            content = _decode_b64(b64_json)
        elif isinstance(url, str) and url:
            content = download_image(requests, url)
        else:
            raise FriendlyError(
                f"第 {index} 个返回结果既没有 b64_json，也没有 url。"
            )
        total_bytes += len(content)
        if total_bytes > MAX_TOTAL_OUTPUT_BYTES:
            raise FriendlyError("本次生成图片总大小超过 200 MB 限制。")
        _write_image(content, destination, output_format)
        if not destination.is_file() or destination.stat().st_size == 0:
            raise FriendlyError(f"图片保存后校验失败：{destination}")
        saved.append(destination)
    return saved


def common_payload(args: argparse.Namespace) -> dict[str, Any]:
    return {
        "model": MODEL,
        "prompt": args.prompt,
        "size": args.size,
        "quality": args.quality,
        "n": args.n,
        "output_format": args.output_format,
    }


def generate(args: argparse.Namespace, requests: Any, headers: dict[str, str]) -> Any:
    return post_with_one_retry(
        requests,
        GENERATIONS_URL,
        headers,
        json_payload=common_payload(args),
    )


def image_content_type(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".png":
        return "image/png"
    if suffix in (".jpg", ".jpeg"):
        return "image/jpeg"
    return "image/webp"


def edit(args: argparse.Namespace, requests: Any, headers: dict[str, str]) -> Any:
    if len(args.image) > MAX_IMAGE_COUNT:
        raise FriendlyError(f"参考图片不能超过 {MAX_IMAGE_COUNT} 张。")
    image_paths = [
        validate_image_file(value, ALLOWED_IMAGE_SUFFIXES, "参考图片")
        for value in args.image
    ]
    mask_path = (
        validate_image_file(args.mask, {".png"}, "遮罩图片")
        if args.mask is not None
        else None
    )
    total_input_bytes = sum(path.stat().st_size for path in image_paths)
    if mask_path is not None:
        total_input_bytes += mask_path.stat().st_size
    if total_input_bytes > MAX_EDIT_INPUT_BYTES:
        raise FriendlyError("参考图片和遮罩总大小不能超过 200 MB。")
    opened_files: list[Any] = []
    multipart: list[tuple[str, tuple[str, Any, str]]] = []
    try:
        for index, image_path in enumerate(image_paths, start=1):
            file_object = image_path.open("rb")
            opened_files.append(file_object)
            multipart.append(
                (
                    "image",
                    (
                        f"image-{index}{image_path.suffix.lower()}",
                        file_object,
                        image_content_type(image_path),
                    ),
                )
            )
        if mask_path is not None:
            mask_object = mask_path.open("rb")
            opened_files.append(mask_object)
            multipart.append(("mask", ("mask.png", mask_object, "image/png")))
        fields = {key: str(value) for key, value in common_payload(args).items()}
        return post_with_one_retry(
            requests,
            EDITS_URL,
            headers,
            data=fields,
            files=multipart,
        )
    except OSError as exc:
        raise FriendlyError(f"无法打开参考图片：{exc.filename or '未知文件'}") from exc
    finally:
        for file_object in opened_files:
            file_object.close()


def _doctor() -> int:
    setup = _setup_module()
    key_present = setup.get_saved_api_key() is not None
    try:
        requests = ensure_requests()
        requests_ok = True
        requests_version = getattr(requests, "__version__", "未知版本")
    except FriendlyError:
        requests_ok = False
        requests_version = ""
    output_ok = False
    try:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=OUTPUT_DIR, delete=True):
            output_ok = True
    except OSError:
        output_ok = False
    print(f"Python 3：正常（{sys.version.split()[0]}）")
    print(f"requests：{'正常（' + requests_version + '）' if requests_ok else '异常'}")
    print(f"本机生图密钥：{'已配置' if key_present else '未配置'}")
    print(f"输出目录：{'可写' if output_ok else '不可写'}（{OUTPUT_DIR.resolve()}）")
    if not key_present:
        print(
            "下一步请把密钥发送给当前 Codex，再由 Codex 通过标准输入保存。",
            file=sys.stderr,
        )
    return 0 if requests_ok and key_present and output_ok else 1


def _setup(force: bool, restore_previous: bool) -> int:
    setup = _setup_module()
    try:
        if restore_previous:
            setup.restore_previous_api_key()
            print("已恢复上一份本机加密密钥；未显示密钥内容。")
            return 0
        setup.configure_key_from_stdin(force=force)
    except setup.SetupError as exc:
        raise FriendlyError(str(exc)) from exc
    print("生图密钥已安全保存到本机；未写入环境变量，也未显示密钥内容。")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="通过 Tian Image 的 gpt-image-2 分组生成或编辑图片。"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    setup_parser = subparsers.add_parser("setup", help="从标准输入安全保存密钥")
    setup_parser.add_argument("--stdin", action="store_true", help="从标准输入读取密钥")
    setup_mode = setup_parser.add_mutually_exclusive_group()
    setup_mode.add_argument("--force", action="store_true", help="重新配置已有密钥")
    setup_mode.add_argument(
        "--restore-previous",
        action="store_true",
        help="恢复上一份本机加密密钥",
    )
    subparsers.add_parser("doctor", help="检查 Python、requests、密钥和输出目录")

    def add_common(subparser: argparse.ArgumentParser) -> None:
        subparser.add_argument(
            "--prompt",
            required=True,
            type=non_empty_prompt,
            help="图片描述或编辑要求",
        )
        subparser.add_argument("--size", choices=ALLOWED_SIZES, default="1024x1024")
        subparser.add_argument(
            "--quality", choices=ALLOWED_QUALITIES, default="auto"
        )
        subparser.add_argument("--n", type=positive_count, default=1)
        subparser.add_argument(
            "--output-format",
            choices=ALLOWED_OUTPUT_FORMATS,
            default="png",
        )
        subparser.add_argument(
            "--output-dir",
            type=Path,
            default=OUTPUT_DIR,
            help=argparse.SUPPRESS,
        )

    generate_parser = subparsers.add_parser("generate", help="文本生成图片")
    add_common(generate_parser)

    edit_parser = subparsers.add_parser("edit", help="编辑参考图片或局部遮罩区域")
    add_common(edit_parser)
    edit_parser.add_argument(
        "--image",
        action="append",
        required=True,
        help="参考图片路径，可多次传入",
    )
    edit_parser.add_argument("--mask", help="可选 PNG 遮罩路径")
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.command == "doctor":
            return _doctor()
        if args.command == "setup":
            return _setup(args.force, args.restore_previous)

        requests = ensure_requests()
        api_key = ensure_api_key()
        headers = {"Authorization": f"Bearer {api_key}"}
        response = (
            generate(args, requests, headers)
            if args.command == "generate"
            else edit(args, requests, headers)
        )
        try:
            items = response_items(response)
        finally:
            response.close()
        paths = save_images(
            requests,
            items,
            args.output_format,
            args.output_dir.expanduser().resolve(),
        )
        for path in paths:
            print(path)
        return 0
    except FriendlyError as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
