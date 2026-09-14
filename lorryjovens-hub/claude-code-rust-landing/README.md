# Claude Code Rust Landing Page

🦀 用 Rust 重写的 Claude Code 官方落地页 - 展示极致性能与现代化设计

## 🌟 特性

- **现代化设计** - 采用 Rust 橙色主题，玻璃态设计风格
- **响应式布局** - 完美适配桌面端和移动端
- **流畅动画** - 使用 Framer Motion 实现丝滑交互体验
- **粒子背景** - Canvas 绘制的动态粒子效果
- **性能展示** - 直观的性能对比数据可视化

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS 样式
- Framer Motion 动画
- Zustand 状态管理

### 后端
- Node.js + Express
- SQLite 数据库
- TypeScript

## 📦 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/claude-code-rust-landing.git

# 进入项目目录
cd claude-code-rust-landing

# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

## 🚀 开发

```bash
# 启动前端开发服务器
cd client
npm run dev

# 启动后端服务器
cd server
npm run dev
```

## 🏗️ 构建

```bash
# 构建前端
cd client
npm run build

# 构建后端
cd server
npm run build
```

## 📂 项目结构

```
claude-code-rust-landing/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── store/          # Zustand 状态管理
│   │   ├── App.tsx         # 主应用组件
│   │   ├── main.tsx        # 入口文件
│   │   └── index.css       # 全局样式
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── server/                 # 后端项目
│   ├── server.ts
│   └── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages 部署配置
├── package.json            # 根项目配置
└── README.md
```

## 🎨 组件列表

| 组件 | 描述 |
|------|------|
| `Navigation` | 顶部导航栏，支持平滑滚动 |
| `Hero` | 主视觉区域，品牌展示 |
| `Performance` | 性能数据展示卡片 |
| `Features` | Rust 语言核心特性介绍 |
| `Architecture` | 技术架构分层图示 |
| `Install` | 多平台安装指南 |
| `Comparison` | Rust vs Node.js 性能对比表 |
| `Contact` | 社区链接和订阅表单 |
| `Footer` | 页脚导航和版权信息 |
| `ParticlesBackground` | 动态粒子背景效果 |

## 🌐 部署

项目使用 GitHub Pages 自动部署：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建和部署
3. 访问 `https://your-username.github.io/claude-code-rust-landing`

## 📄 许可证

MIT License

---

Made with 🦀 and ❤️