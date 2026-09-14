# 心屿空间 Heart Isle Space

深圳首个成年人共学空间展示网站 - 温暖疗愈、自然质感、成人共学

## 项目概述

心屿空间是一个精美的展示网站，采用 React + Node.js + SQLite 技术栈，配合复杂的滚动视差、微交互动效，为访客提供沉浸式的浏览体验。

## 设计概念

### 视觉风格
- **暖大地色系**: 米白(#FAF9F6)、暖灰(#F5F3EF)、赭石(#B8956B)、深绿(#4A5D54)
- **玻璃态设计**: backdrop-filter 模糊效果
- **有机曲线**: 流动的形状与自然元素

### 动效核心
- **平滑滚动**: Smooth Scroll + GSAP ScrollTrigger
- **视差层叠**: Parallax Layers
- **微交互动画**: Framer Motion 驱动

## 技术栈

### 前端
- React 18
- Framer Motion
- GSAP + ScrollTrigger
- Tailwind CSS
- Lucide Icons

### 后端
- Node.js
- Express
- SQLite3
- express-validator

## 项目结构

```
heart-isle-space/
├── client/                     # React 前端
│   ├── src/
│   │   ├── components/         # 组件
│   │   │   ├── Hero.jsx       # 首屏视差动画
│   │   │   ├── About.jsx      # 关于我们
│   │   │   ├── Features.jsx   # 特色服务
│   │   │   ├── SpaceShow.jsx  # 空间展示画廊
│   │   │   ├── Journey.jsx    # 流程时间轴
│   │   │   ├── Booking.jsx    # 预约表单
│   │   │   ├── Navigation.jsx # 导航
│   │   │   ├── Cursor.jsx     # 自定义光标
│   │   │   └── Footer.jsx     # 页脚
│   │   ├── styles/
│   │   │   └── globals.css    # 全局样式
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js 后端
│   ├── routes/
│   │   ├── bookings.js        # 预约 API
│   │   └── events.js          # 活动 API
│   ├── database.js            # 数据库连接
│   ├── server.js              # 主服务
│   └── package.json
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖（根目录、client、server）
npm run install:all
```

或分别安装：

```bash
# 根目录
npm install

# 前端
cd client && npm install

# 后端
cd server && npm install
```

### 2. 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev
```

或分别启动：

```bash
# 终端 1 - 后端
cd server && npm run dev

# 终端 2 - 前端
cd client && npm run dev
```

### 3. 访问网站

- 前端: http://localhost:3000
- 后端 API: http://localhost:5000

## API 接口

### 预约相关
- `GET /api/bookings` - 获取所有预约
- `POST /api/bookings` - 创建预约
- `GET /api/bookings/:id` - 获取单个预约
- `PUT /api/bookings/:id` - 更新预约状态
- `DELETE /api/bookings/:id` - 删除预约
- `GET /api/bookings/availability/:date` - 查询日期可用时间

### 活动相关
- `GET /api/events` - 获取活动列表
- `GET /api/events/:id` - 获取活动详情
- `POST /api/events` - 创建活动（管理员）
- `PUT /api/events/:id` - 更新活动
- `DELETE /api/events/:id` - 删除活动
- `POST /api/events/:id/register` - 活动报名

### 健康检查
- `GET /api/health` - 服务状态检查

## 功能特性

### 前端动效
- ✨ 自定义光标效果（桌面端）
- 🎭 文字逐字显示动画
- 🌊 视差滚动效果
- 🎨 3D 卡片倾斜效果
- 🔮 玻璃态卡片
- 🎯 磁性按钮
- 📱 响应式设计

### 后端功能
- 📅 预约管理系统
- 🎪 活动管理系统
- 📧 表单验证
- 🗄️ SQLite 数据持久化

## 浏览器支持

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)

## 许可证

MIT License

## 联系方式

- 邮箱: hello@heartisle.space
- 电话: 0755-8888-8888
- 地址: 深圳市南山区科技园南区

---

Made with 💚 at Heart Isle Space
