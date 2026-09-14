# 影视天堂 - 在线影视平台

一个现代化的在线影视平台，支持多数据源聚合、分类浏览、搜索和在线播放功能。

##  技术栈

### 前端技术
- **HTML5/CSS3** - 现代化响应式布局
- **原生 JavaScript (ES6+)** - 无框架依赖，轻量高效
- **CSS 变量** - 主题定制和暗色模式
- **LocalStorage** - 本地数据持久化

### 后端技术
- **Node.js** - 运行时环境
- **Express.js** - Web 服务器框架
- **node-fetch** - HTTP 请求库
- **CORS** - 跨域资源共享

### 第三方 API
- **CMS 采集接口** - 兼容苹果 CMS 标准的影视资源 API
- **默认数据源**: https://api.apibdzy.com/api.php/provide/vod/

## 🚀 功能特性

- ✅ **多数据源故障转移** - 自动切换可用数据源，确保内容正常显示
- ✅ 多数据源管理与切换
- ✅ 分类浏览（电影、电视剧、综艺、动漫）
- ✅ 关键词搜索
- ✅ 异步海报加载与缓存
- ✅ 播放源自动筛选（优先 M3U8）
- ✅ 响应式设计（支持 PC/移动端）
- ✅ 暗色主题 UI
- ✅ 分页导航
- ✅ 播放历史记录

## 🔄 数据源故障转移

当默认数据源不可用时，系统会自动尝试以下备用数据源：

1. 无尽资源
2. 闪电资源
3. 百度资源
4. 天空资源
5. 卧龙资源
6. 快帆资源

系统会自动选择第一个可用的数据源并保存为用户的当前选择。

## 📁 项目结构

```
演示视频中的源码/
├── index.html          # 首页（列表页）
├── detail.html         # 详情页
├── player.html         # 播放页
├── settings.html       # 设置页
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── app.js          # 核心逻辑
├── proxy-server.js     # Node.js 代理服务器
├── package.json        # 项目配置
└── README.md           # 项目文档
```

## 🛠️ 本地开发

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖
```bash
npm install
```

### 启动服务
```bash
npm start
```

访问 http://localhost:3000

## ☁️ 云部署

### Vercel 部署（推荐前端）

Vercel 适合部署纯前端版本，需要配合独立的后端代理服务。

1. 访问 [vercel.com](https://vercel.com)
2. 导入 GitHub 仓库
3. 配置构建设置：
   - Framework Preset: `Other`
   - Build Command: 留空
   - Output Directory: 留空
4. 点击 Deploy

**注意**: Vercel 部署需要修改 API 代理地址，建议使用独立的代理服务。

### Render 部署（全栈部署）

Render 支持完整的 Node.js 应用部署。

1. 访问 [render.com](https://render.com)
2. 创建新 Web Service
3. 连接 GitHub 仓库
4. 配置：
   - **Name**: 自定义服务名称
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. 点击 Create Web Service

### 环境变量（可选）

```bash
PORT=3000           # 服务端口
NODE_ENV=production # 运行环境
```

## 📡 API 接口说明

### 数据源格式

```json
{
  "id": 1,
  "name": "资源站 1",
  "url": "https://api.apibdzy.com/api.php/provide/vod/",
  "active": true
}
```

### 核心接口参数

| 参数  | 说明       | 示例                    |
| --- | -------- | --------------------- |
| ac  | 操作类型     | `list` / `detail`     |
| pg  | 页码       | `1`, `2`, `3`         |
| t   | 分类 ID    | `1`, `2`, `13`, `14`  |
| ids | 视频 ID    | `48525`               |
| wd  | 搜索关键词   | `海贼王`                |

### 接口示例

- 列表：`/api.php/provide/vod/?ac=list&pg=1`
- 详情：`/api.php/provide/vod/?ac=detail&ids=48525`
- 搜索：`/api.php/provide/vod/?ac=list&wd=海贼王`
- 分类：`/api.php/provide/vod/?ac=list&t=13&pg=1`

## 🔧 配置说明

### 添加自定义数据源

1. 访问 `/settings.html` 设置页面
2. 点击"添加数据源"
3. 输入数据源名称和 API 地址
4. 保存并切换

### 数据源要求

- 支持 CMS 采集接口标准
- 返回 JSON 格式数据
- 允许 CORS 跨域访问

## 📝 核心模块

### Storage 模块
本地存储管理，封装 localStorage 操作。

### SourceManager 模块
数据源管理，支持多数据源 CRUD 操作。

### Api 模块
API 请求封装，支持缓存和预加载。

### VideoParser 模块
播放地址解析，支持多播放源和 M3U8 筛选。

### PosterCache 模块
海报缓存，减少重复请求。

### UI 模块
UI 渲染工具，包括加载状态、空状态、错误处理等。

## 🎨 UI 设计

- **主色调**: `#e50914` (Netflix 红)
- **背景色**: `#141414` (深色背景)
- **卡片色**: `#1f1f1f`
- **圆角**: `8px`
- **阴影**: `0 4px 6px rgba(0, 0, 0, 0.3)`

## 📱 响应式断点

| 断点 | 宽度范围 | 布局 |
| --- | --- | --- |
| Mobile | < 480px | 2 列网格 |
| Mobile | 480px - 768px | 3 列网格 |
| Tablet | 769px - 1024px | 4 列网格 |
| Desktop | 1025px - 1200px | 5-6 列网格 |
| Large | > 1200px | 7 列网格 |

## ⚠️ 注意事项

1. 本项目仅供学习交流使用
2. 请勿用于商业目的
3. 注意版权问题
4. 部署时请遵守当地法律法规

## 📄 License

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**项目技术栈总结**:

| 类别 | 技术 | 用途 |
| --- | --- | --- |
| 前端 | HTML5/CSS3 | 页面结构和样式 |
| 前端 | JavaScript ES6+ | 交互逻辑 |
| 后端 | Node.js | 运行时 |
| 后端 | Express | Web 服务器 |
| 部署 | Vercel | 前端托管 |
| 部署 | Render | 全栈部署 |