# 🦜 Claude Desktop — 自由、强大的 AI 桌面客户端

<p align="center">
  <img src="public/favicon.png" width="120" alt="Claude Desktop Logo">
</p>

<p align="center">
  <strong>一个基于 Electron + React 构建的跨平台 AI 桌面客户端，支持 Claude、GPT、GLM、Gemini 等主流大模型</strong>
</p>

<p align="center">
  <a href="https://github.com/lorryjovens-hub/claude-code---electron--Desktop/releases/latest">
    <img src="https://img.shields.io/github/v/release/lorryjovens-hub/claude-code---electron--Desktop?style=for-the-badge&logo=github&labelColor=1a1a2e&color=387ee0" alt="Latest Release">
  </a>
  <a href="https://github.com/lorryjovens-hub/claude-code---electron--Desktop/releases">
    <img src="https://img.shields.io/github/downloads/lorryjovens-hub/claude-code---electron--Desktop/total?style=for-the-badge&logo=github&labelColor=1a1a2e&color=4B9C68" alt="Downloads">
  </a>
  <a href="https://github.com/lorryjovens-hub/claude-code---electron--Desktop/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/lorryjovens-hub/claude-code---electron--Desktop?style=for-the-badge&logo=github&labelColor=1a1a2e&color=D97757" alt="License">
  </a>
  <a href="https://github.com/lorryjovens-hub/claude-code---electron--Desktop/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/lorryjovens-hub/claude-code---electron--Desktop/build.yml?style=for-the-badge&logo=githubactions&labelColor=1a1a2e&color=7C3AED" alt="Build Status">
  </a>
</p>

<p align="center">
  <strong>🌐 Windows · macOS · Linux — 全平台支持</strong>
</p>

---

## ✨ 为什么需要这个项目？

由于 Claude 官方的地区封锁和实名制政策，大多数中国用户无法正常使用官方客户端。本项目应运而生——**让你无需翻墙、无需实名，即可享受完整的 Claude 桌面体验**。

不仅如此，我们还聚合了多个主流 AI 模型服务商，一个客户端即可调用 Claude、GPT、GLM、Gemini、DeepSeek 等多种模型。

## 🚀 核心特性

### 🎨 极致体验
- **原生级 UI 设计** — 精美的动画、流畅的交互、优雅的排版
- **多标签对话** — 同时开启多个对话，高效切换
- **代码高亮** — 内置语法高亮，支持 Mermaid 图表渲染
- **数学公式** — 完美支持 LaTeX 数学公式显示
- **文件上传** — 支持图片、文档、代码文件上传分析
- **GitHub 集成** — 直接引用 GitHub 仓库代码进行分析

### 🤖 多模型聚合
- **Claude 全系列** — Opus、Sonnet、Haiku 等最新模型
- **OpenAI** — GPT-4o、GPT-4o-mini、o3-mini
- **Google** — Gemini 2.5 Pro、Gemini 2.5 Flash
- **智谱 GLM** — GLM-5 Plus、GLM-4 Plus
- **DeepSeek** — DeepSeek V3、DeepSeek R1
- **MiniMax** — MiniMax M1
- **通义千问** — Qwen 系列模型
- **SiliconFlow** — 聚合多模型服务

### 💰 自建中转站
- **内置 OneAPI 服务** — 一键部署多模型聚合网关
- **用户管理系统** — 支持自助注册、分组定价
- **计费与充值** — 完善的额度管理、兑换码系统
- **多渠道路由** — 智能模型匹配，自动选择最优服务商

### 🔧 开发者友好
- **Claude Code SDK 集成** — 支持终端内直接调用 AI 编程助手
- **自定义系统提示** — 可配置专属系统提示词
- **API 兼容** — 完全兼容 OpenAI / Anthropic API 格式
- **开源可审计** — 所有代码公开透明

## 📥 下载安装

### Windows
```powershell
# 方法 1：直接下载安装包
# 前往 Releases 页面下载 Claude Desktop Setup x.x.x.exe

# 方法 2：使用 winget（即将支持）
winget install lorryjovens-hub.ClaudeDesktop
```

### macOS
```bash
# 方法 1：下载 DMG 安装包
# 前往 Releases 页面下载 Claude Desktop x.x.x.dmg

# 方法 2：使用 Homebrew（即将支持）
brew install --cask claude-desktop
```

### Linux
```bash
# AppImage
chmod +x Claude\ Desktop-x.x.x.AppImage
./Claude\ Desktop-x.x.x.AppImage

# Debian/Ubuntu
sudo dpkg -i claude-desktop_x.x.x_amd64.deb
```

## 🛠️ 快速开始

### 方式一：使用内置 API（推荐新手）

1. **下载并安装客户端**
2. **打开应用**，进入设置 → 模型配置
3. **添加模型渠道**，填入你的 API Key（支持 SiliconFlow、智谱、DeepSeek 等）
4. **开始对话** — 享受 AI 带来的效率提升！

### 方式二：自建 OneAPI 中转站（推荐高级用户）

```bash
# 1. 克隆 OneAPI 项目
git clone https://github.com/songquanpeng/one-api.git
cd one-api

# 2. 使用 Docker Compose 启动
docker compose up -d

# 3. 访问管理面板
# http://localhost:3002
# 默认账号：root / 123456

# 4. 配置模型渠道，添加你的 API Key

# 5. 在 Claude Desktop 中配置
# 设置 → 模型 → 添加自部署渠道
# Base URL: http://127.0.0.1:3002/v1
# API Key: 你在 OneAPI 中创建的 Token
```

## 📸 界面预览

> 精美的界面设计，流畅的交互动画，带来原生级的使用体验

*(截图待添加)*

## 🔧 开发指南

### 环境要求
- **Node.js** >= 20
- **npm** >= 10
- **Git**

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/lorryjovens-hub/claude-code---electron--Desktop.git
cd claude-code---electron--Desktop

# 2. 安装依赖
npm install

# 3. 启动开发模式
npm run electron:dev

# 4. 构建生产版本
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

### 项目结构

```
├── dist/                 # Vite 构建产物
├── electron/             # Electron 主进程
│   ├── main.cjs          # 主进程入口
│   ├── bridge-server.cjs # API 桥接服务
│   └── chat-config.cjs   # 模型路由配置
├── src/                  # React 渲染进程
│   ├── components/       # UI 组件
│   ├── api.ts            # API 接口
│   └── App.tsx           # 应用入口
├── engine/               # Claude Code SDK 引擎
├── public/               # 静态资源
└── release/              # 打包输出目录
```

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| **桌面框架** | Electron 41 |
| **前端框架** | React 19 + TypeScript |
| **构建工具** | Vite 6 |
| **样式方案** | Tailwind CSS 3 |
| **路由** | React Router 6 |
| **Markdown** | react-markdown + rehype-katex + remark-gfm |
| **代码高亮** | highlight.js + react-syntax-highlighter |
| **图表** | Mermaid + Recharts |
| **动画** | GSAP + Lottie |
| **打包工具** | electron-builder |
| **CI/CD** | GitHub Actions |

## 📋 支持的模型列表

| 服务商 | 模型 | 格式 | 特色功能 |
|--------|------|------|----------|
| Anthropic | Claude Opus 4.6 | Anthropic | 联网搜索 |
| Anthropic | Claude Sonnet 4.6 | Anthropic | 联网搜索 |
| Anthropic | Claude Haiku 4.5 | Anthropic | 联网搜索 |
| OpenAI | GPT-4o | OpenAI | - |
| OpenAI | GPT-4o-mini | OpenAI | - |
| OpenAI | o3-mini | OpenAI | - |
| Google | Gemini 2.5 Pro | OpenAI | - |
| Google | Gemini 2.5 Flash | OpenAI | - |
| 智谱 | GLM-5 Plus | OpenAI | 联网搜索 |
| 智谱 | GLM-4 Plus | OpenAI | 联网搜索 |
| DeepSeek | DeepSeek V3 | OpenAI | - |
| DeepSeek | DeepSeek R1 | OpenAI | - |
| MiniMax | MiniMax M1 | OpenAI | - |
| 通义千问 | Qwen 系列 | OpenAI | 联网搜索 |

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📝 更新日志

### v1.7.0 (2025-05-03)
- 🎉 完全移除第三方品牌依赖，全面自主化
- 🚀 支持 Windows、macOS、Linux 三平台
- 🤖 新增 SiliconFlow、MiniMax、Gemini 等模型支持
- 💰 内置 OneAPI 中转站完整功能
- 🎨 全新设计的 UI 界面
- 🔧 优化模型路由和错误处理

*(完整更新日志见 [Releases](https://github.com/lorryjovens-hub/claude-code---electron--Desktop/releases))*

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源。

## 💬 联系我们

- 📧 邮箱：2574566046@qq.com
- 🐛 问题反馈：[Issues](https://github.com/lorryjovens-hub/claude-code---electron--Desktop/issues)
- 💡 功能建议：[Discussions](https://github.com/lorryjovens-hub/claude-code---electron--Desktop/discussions)

## ⭐ Star History

如果这个项目对你有帮助，请给我们一个 ⭐ Star，这将是对我们最大的鼓励！

[![Star History Chart](https://api.star-history.com/svg?repos=lorryjovens-hub/claude-code---electron--Desktop&type=Date)](https://star-history.com/#lorryjovens-hub/claude-code---electron--Desktop&Date)

---

<p align="center">
  <strong>Made with ❤️ by lorry</strong>
</p>
