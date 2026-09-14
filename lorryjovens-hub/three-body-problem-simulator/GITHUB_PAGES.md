# 🚀 GitHub Pages 部署指南

## 部署状态

你的三体问题模拟器项目已成功推送到 GitHub，并配置了自动化部署！

### 📍 GitHub 地址
```
https://github.com/lorryjovens-hub/three-body-problem-simulator
```

### 🌐 GitHub Pages 地址
```
https://lorryjovens-hub.github.io/three-body-problem-simulator/
```

---

## ✅ 已完成的设置

### 1. Git 初始化与推送 ✓
- ✅ 本地 Git 仓库已初始化
- ✅ 所有文件已提交
- ✅ 代码已推送到 GitHub main 分支

### 2. GitHub Actions 工作流 ✓
- ✅ 自动构建流程已配置
- ✅ 自动部署到 GitHub Pages 已配置
- ✅ 路径配置已更新 (base: '/three-body-problem-simulator/')

### 3. Vite 配置 ✓
- ✅ base 路径已设置为 `/three-body-problem-simulator/`
- ✅ 确保在子页面路径下正确加载资源

---

## 🎯 后续步骤

### 步骤 1：启用 GitHub Pages
1. 访问你的 GitHub 仓库：
   ```
   https://github.com/lorryjovens-hub/three-body-problem-simulator
   ```

2. 进入 **Settings** → **Pages**

3. 在 **Build and deployment** 部分：
   - **Source**：选择 "GitHub Actions"
   - **Branch**：应该会自动选择 "main"

4. 保存设置

### 步骤 2：检查部署状态
1. 进入 **Actions** 标签页
2. 查看最新的工作流运行状态
3. 如果显示 ✅ 绿色勾号，部署成功
4. 如果显示 ❌ 红色错误，检查构建日志

### 步骤 3：访问你的网站
部署完成后（通常需要几分钟），访问：
```
https://lorryjovens-hub.github.io/three-body-problem-simulator/
```

---

## 📋 部署工作流说明

### `.github/workflows/deploy.yml` 功能

这个工作流会在以下情况自动运行：
- ✅ 推送代码到 `main` 分支
- ✅ 创建 Pull Request 到 `main` 分支

### 工作流步骤

```
1. 检出代码
   ↓
2. 设置 Node.js 18
   ↓
3. 安装依赖 (npm ci)
   ↓
4. 构建项目 (npm run build)
   ↓
5. 上传到 GitHub Pages
   ↓
6. 部署到 GitHub Pages
   ↓
✅ 完成！网站已更新
```

---

## 🔧 常见问题

### Q1: 网站无法访问
**A**: 
1. 确认 GitHub Pages 已启用
2. 等待 Actions 工作流完成（查看绿色勾号）
3. 清除浏览器缓存后刷新

### Q2: 样式/资源加载失败
**A**: 
这通常是因为相对路径问题。已在 `vite.config.ts` 中设置 `base: '/three-body-problem-simulator/'`

### Q3: 页面加载正常但功能不工作
**A**: 
1. 打开浏览器开发者工具 (F12)
2. 检查 Console 标签中的错误信息
3. 查看 Network 标签中的资源加载

### Q4: 部署失败
**A**: 
1. 进入 Actions 标签页
2. 点击失败的工作流
3. 查看详细的错误日志
4. 常见原因：
   - npm install 失败
   - 构建错误
   - 权限问题

---

## 📦 项目结构

```
three-body-problem-simulator/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions 工作流
├── src/
│   ├── components/
│   │   ├── Landing.tsx         ← 介绍页面
│   │   ├── Simulation.tsx
│   │   └── Controls.tsx
│   ├── physics/
│   │   └── rk4.ts
│   ├── App.tsx
│   └── main.tsx
├── dist/                        ← 构建输出（GitHub Pages 会部署这个）
├── vite.config.ts              ← 已配置 base 路径
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🌐 URL 映射

当访问 GitHub Pages 时，所有请求都会基于 base 路径：

| 本地路径 | GitHub Pages 路径 |
|---------|------------------|
| `/` | `/three-body-problem-simulator/` |
| `/assets/...` | `/three-body-problem-simulator/assets/...` |
| 任何应用内 URL | `/three-body-problem-simulator/...` |

这已通过 Vite 的 `base` 配置自动处理。

---

## 🔄 更新网站

### 推送更改自动部署

每当你在 `main` 分支上推送代码时，自动化流程会：

```bash
# 1. 本地修改完代码
# 2. 提交更改
git add .
git commit -m "更新内容"

# 3. 推送到 GitHub
git push origin main

# 4. GitHub Actions 自动构建和部署
# 5. 网站在几分钟内自动更新
```

### 检查部署进度

1. 进入 https://github.com/lorryjovens-hub/three-body-problem-simulator/actions
2. 查看最新的工作流运行
3. 等待所有步骤完成

---

## 📊 部署统计

| 项目 | 值 |
|------|-----|
| **GitHub 仓库** | lorryjovens-hub/three-body-problem-simulator |
| **部署方式** | GitHub Actions → GitHub Pages |
| **部署分支** | main |
| **网站 URL** | https://lorryjovens-hub.github.io/three-body-problem-simulator/ |
| **自动构建** | ✅ 启用 |
| **HTTPS** | ✅ 自动 |
| **自定义域名** | ✅ 支持（可选） |

---

## 🎯 网站特性

你的 GitHub Pages 网站将包含：

1. ✨ **令人印象深刻的介绍页面**
   - 动态粒子背景
   - 流畅动画
   - 首次给访客好印象

2. 🚀 **完整的 3D 模拟器**
   - 交互式模拟
   - 实时参数调整
   - 高性能渲染

3. 📱 **完全响应式**
   - 在所有设备上美观
   - 能够完整使用

4. ⚡ **高性能**
   - Fast Loading
   - Smooth Animations
   - Optimized Assets

---

## 💡 可选：自定义域名

如果你有自己的域名，可以将其指向 GitHub Pages：

1. 在 GitHub 仓库 Settings → Pages
2. 在 "Custom domain" 输入你的域名
3. 按照说明配置 DNS 记录

---

## 🆘 需要帮助？

### 查看 GitHub Pages 文档
- https://docs.github.com/en/pages

### 查看 GitHub Actions 文档
- https://docs.github.com/en/actions

### 查看 Vite 部署文档
- https://vitejs.dev/guide/static-deploy.html

---

## ✅ 检查清单

部署完成前的检查：

- [ ] GitHub 仓库已创建
- [ ] 代码已推送到 main 分支
- [ ] GitHub Pages 已在 Settings 中启用
- [ ] Actions 工作流已成功运行（绿色勾号）
- [ ] 网站在 `https://lorryjovens-hub.github.io/three-body-problem-simulator/` 可访问
- [ ] 页面加载正常
- [ ] 介绍页面显示正确
- [ ] 可以点击"开始模拟"进入应用

---

## 🎉 完成！

你的三体问题模拟器项目现在在 GitHub Pages 上线了！🚀

**立即分享你的项目**：
```
https://lorryjovens-hub.github.io/three-body-problem-simulator/
```

**或在 GitHub 上查看**：
```
https://github.com/lorryjovens-hub/three-body-problem-simulator
```

---

## 📞 后续支持

如需进一步帮助，你可以：
1. 查看本文档中的常见问题
2. 检查 GitHub Actions 日志
3. 查看浏览器开发者工具
4. 参考项目的 README.md

**祝你的项目获得很棒的展示！** 🌟

---

*最后更新*：2025-04-02
