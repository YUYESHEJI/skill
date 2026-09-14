# 🎯 快速启动指南

## 项目现已更新！

三体问题模拟器现在包含一个**令人惊艳的前端介绍页面**。

## 🚀 开始使用

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:3000`

### 首次打开会看到什么

当你首次打开应用时，你会看到一个精美的登陆页面，包含：

1. ✨ **动态星空背景** - 实时粒子系统
2. 🎯 **英雄部分** - 项目名称和价值主张
3. ⚡ **核心特性展示** - 6个关键功能的介绍卡片
4. 🎬 **预设场景展览** - Figure-8、双星系统、自定义配置
5. 🛠️ **技术栈** - 使用的所有技术
6. 📊 **性能指标** - 关键性能数据
7. 🎬 **行动召唤** - "开始模拟"按钮
8. 📝 **页脚** - 项目信息和链接

### 进入模拟器

点击页面上的任何 **"开始模拟"** 按钮，你会进入完整的3D交互式模拟器。

### 返回介绍页面

在模拟器界面，点击右上角的 **"← 返回介绍"** 按钮可以回到介绍页面。

---

## 🎨 介绍页面特点

### 设计风格
- **宇宙科幻极简** 审美
- 深黑色背景配合霓虹青色、紫色亮点
- 流畅的动画和微交互
- 完全响应式设计

### 关键元素

| 元素 | 描述 |
|------|------|
| Canvas背景 | 实时渲染的闪烁星空粒子 |
| Hero图文 | 项目名称+价值主张+CTA |
| 特性卡片 | 6个核心功能介绍 |
| 预设展示 | 3个预设场景的动画展示 |
| 技术栈 | 8个使用的技术标签 |
| 性能数据 | 关键指标展示 |

### 动画效果
- ✅ 页面加载时的淡入动画
- ✅ 滚动时的触发动画 (whileInView)
- ✅ 悬停时的交互效果
- ✅ 平滑的过渡效果
- ✅ 持续的呼吸和浮动动画

---

## 📁 项目结构更新

```
src/
├── components/
│   ├── Landing.tsx          ← 🆕️ 新的介绍页面组件
│   ├── Simulation.tsx
│   └── Controls.tsx
├── physics/
│   └── rk4.ts
├── App.tsx                  ← 已更新，支持页面切换
├── constants.ts
├── index.css
└── main.tsx
```

---

## 🔧 关键代码更改

### App.tsx
- 添加了 `showSimulation` 状态来控制页面显示
- 导入了新的 `Landing` 组件
- 添加了条件渲染逻辑
- 添加了"返回介绍"按钮

### Landing.tsx (新文件)
- `CosmicBackground` - Canvas粒子背景
- `FeatureCard` - 特性卡片组件
- `PresetCard` - 预设场景卡片
- `Landing` - 主要容器组件

---

## 🎬 用户流程

```
应用启动
  ↓ (第一次访问)
介绍页面
  ├─ 浏览内容
  ├─ 动画交互
  └─ [点击开始模拟]
     ↓
  3D模拟器
  ├─ 运行模拟
  ├─ 调整参数
  └─ [点击返回介绍]
     ↓
  介绍页面 (可重复)
```

---

## ✨ 响应式设计

介绍页面在所有设备上看起来都很棒：

- 📱 **移动端** (< 640px)
  - 单列布局
  - 较小的文字
  - 适应性边距

- 📊 **平板** (640px - 1024px)
  - 2-3列网格
  - 中等文字大小
  - 平衡的间距

- 🖥️ **桌面** (> 1024px)
  - 完整的3-4列网格
  - 最佳的视觉效果
  - 全部动画效果

---

## 🛠️ 技术栈

### 前端框架
- React 19
- TypeScript
- Tailwind CSS

### 动画库
- Motion - 高性能动画

### 图标库
- Lucide React - 美观的SVG图标

### 构建工具
- Vite - 闪电快的构建工具
- @tailwindcss/vite - Tailwind集成

### 3D引擎（模拟器部分）
- Three.js
- React Three Fiber
- @react-three/postprocessing

---

## 💡 自定义介绍页面

### 修改颜色方案
编辑 `src/components/Landing.tsx` 中的颜色值：

```typescript
// 示例：改变紫色为蓝色
// from-purple-500 → from-blue-500
// to-purple-400 → to-blue-400
```

### 添加新的特性卡片
```typescript
<FeatureCard
  index={6}
  icon={<YourIcon className="w-6 h-6" />}
  title="新功能名称"
  description="新功能的描述"
/>
```

### 修改预设场景
```typescript
const presets = [
  {
    name: "你的场景名",
    description: "场景描述",
    colors: ["#color1", "#color2", "#color3"],
  },
  // ...更多预设
];
```

---

## 🚀 生产部署

构建生产版本：
```bash
npm run build
```

输出文件在 `dist/` 目录中。

预览生产版本：
```bash
npm run preview
```

---

## 📚 相关文件
- 详查详细设计文档：[LANDING_PAGE.md](./LANDING_PAGE.md)
- 查看主README：[README.md](./README.md)
- 查看贡献指南：[CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🎉 享受！

现在你已经有了一个令人印象深刻的介绍页面来展示这个三体问题模拟器项目！

🌌 **探索宇宙的复杂性** ✨
