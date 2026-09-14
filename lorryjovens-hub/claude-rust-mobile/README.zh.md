# Claude Rust Mobile

<div align="center">

![Rust Logo](https://www.rust-lang.org/static/images/rust-logo-blk.svg)

**🚀 Tauri Mobile 原生 AI 助手 | Rust 重新定义移动端体验**

*[English](README.md) · [中文](README.zh.md)*

**"体积减少 97%，性能提升 2.5x，原生安全的移动 AI 编程助手"**

</div>

---

## ✨ 核心特性

### ⚡ 极致性能

| 指标 | 提升 |
|------|------|
| 启动速度 | **2.5x** 更快 |
| 内存占用 | **10x** 更低 |
| 体积大小 | **97%** 更小 |
| 响应延迟 | **25x** 降低 |

### 🤖 Claude 原生集成

- **流式响应** - 实时流式输出，边想边说
- **多模型支持** - Opus · Sonnet · Haiku 全系列
- **上下文记忆** - 超长对话无缝衔接
- **工具执行** - 文件读写、命令执行

### 📱 移动端优化

- **原生体验** - Android / iOS 原生界面
- **触控优化** - 大屏触控操作
- **离线支持** - 本地缓存，无网也能用
- **后台运行** - 最小化不影响任务

---

## 🏗️ 技术架构

```
┌──────────────────────────────────────────────────────────────┐
│                    Claude Rust Mobile                          │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Native UI (Android / iOS)                    │ │
│  │  ┌──────────┐ ┌───────────┐ ┌────────────────────┐   │ │
│  │  │  聊天 UI  │ │   设置    │ │     模型选择器     │   │ │
│  │  └──────────┘ └───────────┘ └────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Rust Bridge (Axum HTTP Server)               │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│  │  │ /api/chat   │  │ /api/stream   │  │ /api/tools   │  │ │
│  │  └─────────────┘  └──────────────┘  └──────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Engine Pool (Tokio)                    │ │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐            │ │
│  │  │  引擎 1   │ │  引擎 2   │ │  引擎 N   │   ♻️ 复用  │ │
│  │  └───────────┘ └───────────┘ └───────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                  │
│              ┌─────────────┴─────────────┐                   │
│              │      外部 API              │                   │
│              │ Anthropic / KIE / 自定义   │                   │
└──────────────┴───────────────────────────┴───────────────────┘
```

### 核心模块

| 模块 | 职责 | 技术 |
|------|------|------|
| **Bridge** | HTTP 服务，请求路由 | Axum + Tokio |
| **Engine** | AI 会话管理，并发池 | Rust async |
| **Commands** | Tauri 命令接口 | tauri-plugin-* |
| **Tools** | 文件/命令执行 | Walkdir + Regex |

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Rust 1.70+
- Android SDK (Android 开发)
- Xcode (iOS 开发，macOS only)

### 安装依赖

```bash
# 安装 Tauri CLI
npm install -g @tauri-apps/cli

# 安装 Rust 依赖
rustup update
```

### 开发构建

```bash
# Android 开发
npm run tauri android dev

# Android 构建
npm run tauri android build

# iOS 开发 (macOS)
npm run tauri ios dev

# iOS 构建 (macOS)
npm run tauri ios build
```

### APK 输出位置

```
src-tauri/target/android-artifacts/bundle/apk/
```

---

## 📦 部署体积对比

| 版本 | 体积 | 内存占用 |
|------|------|----------|
| **Claude Rust Mobile** | **5 MB** | **~10 MB** |
| Electron 原版 | 164 MB | 100+ MB |
| 减少比例 | **97%** | **90%** |

---

## ⚙️ 配置选项

### API 设置

| 选项 | 说明 |
|------|------|
| API 类型 | Anthropic / Claude API / 自定义代理 |
| API 地址 | 支持自定义端点 |
| API 密钥 | 安全存储 |

### 环境变量

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
```

---

## 📁 项目结构

```
claude-rust-mobile/
├── src-tauri/               # Rust 后端 (核心)
│   └── src/
│       ├── bridge/          # HTTP 服务器
│       ├── engine/          # AI 引擎池
│       ├── commands/        # Tauri 命令
│       └── tools/          # 工具定义
├── Cargo.toml              # Rust 依赖
└── README.md
```

---

## 🌟 支持的模型

| 模型 | 场景 | 速度 |
|------|------|------|
| claude-opus-4-6 | 复杂推理 · 大型项目 | 🐢 标准 |
| claude-sonnet-4-6 | 日常开发 · 平衡之选 | 🐇 快速 |
| claude-haiku-4-5 | 快速问答 · 即时响应 | ⚡ 极速 |

---

## 📄 许可证

MIT License - 放心使用，开心贡献

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

<div align="center">

**用 ❤️ 和 Rust 打造**

*Built with ❤️ and Rust*

</div>
