#!/bin/sh
# macOS launcher for tian-image: run tian_image.py with the system Python 3.
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
if ! command -v python3 >/dev/null 2>&1; then
    echo "错误：未找到 python3。请先安装 macOS 命令行开发者工具。" >&2
    exit 1
fi
exec python3 "$SCRIPT_DIR/tian_image.py" "$@"
