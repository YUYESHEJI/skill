---
name: tian-image
description: 通过 Tian Image 的 OpenAI 兼容接口生成或编辑图片，供 Codex 桌面版（macOS）和 Codex CLI 使用。
---

# Tian Image 图片生成与编辑（macOS 版）

使用 `scripts/tian_image.py` 完成文本生图、参考图编辑和 PNG 遮罩修改。固定接口和模型：

- 文本生图：`https://tian.yituohub.com/v1/images/generations`
- 图片编辑：`https://tian.yituohub.com/v1/images/edits`
- 模型：`gpt-image-2`

## 运行环境（macOS）

macOS 版不再捆绑 Windows Python 运行时，改为调用系统 `python3`。首次运行会自动安装 `requests`（需要联网，优先使用 `vendor/wheels/` 内的离线 wheel，失败后回退到 PyPI / 清华镜像）。统一通过启动器调用：

```text
scripts/tian_image.sh doctor
```

## 配置

先运行：

```text
scripts/tian_image.sh doctor
```

用户已在当前聊天中提供密钥时，通过标准输入保存，不打开网页、不访问账户页面、不写入环境变量：

```text
echo 用户提供的密钥 | scripts/tian_image.sh setup --stdin
```

不要在回复、日志、命令行参数、环境变量、Skill 文件、项目代码或 Git 中复述密钥。macOS 将密钥保存在 `~/.config/TianImage/image-api-key.bin`（目录 0700、文件 0600，仅当前用户可读）。替换密钥使用 `setup --stdin --force`；恢复使用 `setup --restore-previous`。

## 生成

```text
scripts/tian_image.sh generate --prompt "一只小猫坐在窗边，简洁插画" --size 1024x1024 --quality low --n 1 --output-format png
```

支持尺寸 `1024x1024`、`1536x1024`、`1024x1536`、`auto`；质量 `low`、`medium`、`high`、`auto`；输出格式 `png`、`jpeg`、`webp`。结果保存到 `~/tian_image_output/`，必须检查文件存在、非空和格式有效后再交付；需要桌面文件时复制到用户桌面并报告绝对路径。

## 编辑

```text
scripts/tian_image.sh edit --prompt "保留主体，把背景换成傍晚海边" --image "/Users/<用户名>/absolute/source.png" --size 1024x1024 --quality high
```

编辑会把用户图片上传到固定 Tian Image 接口；涉及隐私内容时先确认。`--mask` 只接受 PNG。

## 排错

`401/403` 通常表示密钥无效、模型权限或额度问题；`429` 按脚本重试。只排查本机 Python、requests、本机凭据、额度、网络和固定接口，不更换未授权服务，不输出密钥内容。
