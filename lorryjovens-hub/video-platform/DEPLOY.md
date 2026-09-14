# VPS 部署指南（1Panel / 宝塔面板）

本指南介绍如何使用 VPS 配合 1Panel 或 宝塔面板部署影视平台。

---

## 📋 前置要求

- 一台 VPS 服务器（推荐配置：1 核 1G 以上）
- 操作系统：Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- 已安装 1Panel 或 宝塔面板
- 域名（可选，用于 HTTPS 访问）

---

## 🔧 方案一：1Panel 面板部署

### 步骤 1：安装 1Panel

```bash
# Ubuntu/Debian
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sudo bash quick_start.sh

# CentOS/RHEL
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sudo bash quick_start.sh
```

安装完成后，访问 `http://你的服务器 IP:端口` 登录面板。

### 步骤 2：在 1Panel 中创建网站

1. 登录 1Panel 面板
2. 进入 **网站** → **创建网站**
3. 选择 **运行环境** → **Node.js**
4. 配置：
   - **网站名称**: video-platform
   - **根目录**: `/opt/1panel/apps/video-platform`
   - **Node.js 版本**: 18.x 或更高
   - **启动命令**: `npm start`
   - **监听端口**: 3000

### 步骤 3：上传项目代码

**方式 A：通过 Git 克隆**

```bash
# 进入网站根目录
cd /opt/1panel/apps/video-platform

# 克隆项目
git clone https://github.com/lorryjovens-hub/video-platform.git .

# 安装依赖
npm install
```

**方式 B：通过 1Panel 文件管理器上传**

1. 在 1Panel 中进入 **文件**
2. 上传项目文件到网站根目录
3. 在终端执行 `npm install`

### 步骤 4：配置反向代理（可选）

如果需要将应用代理到 80 端口：

1. 进入 **网站** → 选择网站 → **设置**
2. 配置 **反向代理**
   - 代理名称：video-proxy
   - 源服务器：`http://127.0.0.1:3000`

### 步骤 5：配置 SSL（可选）

1. 进入 **网站** → 选择网站 → **SSL**
2. 申请免费 Let's Encrypt 证书
3. 开启 **强制 HTTPS**

### 步骤 6：配置防火墙

在 1Panel 中：
1. 进入 **安全** → **防火墙**
2. 放行端口 3000（如果未使用反向代理）

---

## 🔧 方案二：宝塔面板部署

### 步骤 1：安装宝塔面板

```bash
# CentOS
yum install -y wget && wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh

# Ubuntu/Debian
wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

安装完成后，访问面板地址并登录。

### 步骤 2：安装 Node.js

1. 登录宝塔面板
2. 进入 **软件商店**
3. 搜索并安装 **Node.js 项目管理器**
4. 或者通过 SSH 安装：

```bash
# 使用 nvm 安装 Node.js 18
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 步骤 3：创建网站

1. 进入 **网站** → **添加站点**
2. 配置：
   - **域名**: 你的域名（或服务器 IP）
   - **根目录**: `/www/wwwroot/video-platform`
   - **数据库**: 无需
   - **PHP 版本**: 纯静态
   - **数据库账号**: 无需

### 步骤 4：上传项目代码

**方式 A：通过 Git 克隆**

```bash
cd /www/wwwroot/video-platform
git clone https://github.com/lorryjovens-hub/video-platform.git .
npm install
```

**方式 B：通过宝塔文件管理器**

1. 进入 **文件**
2. 上传项目文件到 `/www/wwwroot/video-platform`
3. 通过 **终端** 执行 `npm install`

### 步骤 5：配置 Node.js 项目

1. 进入 **Node.js 项目管理器**
2. 点击 **添加 Node.js 项目**
3. 配置：
   - **项目名称**: video-platform
   - **项目路径**: `/www/wwwroot/video-platform`
   - **启动文件**: `proxy-server.js`
   - **端口**: 3000
   - **是否开机启动**: 是

### 步骤 6：配置反向代理

1. 进入 **网站** → 选择网站 → **设置**
2. 进入 **反向代理** → **添加反向代理**
3. 配置：
   - **代理名称**: video-proxy
   - **目标 URL**: `http://127.0.0.1:3000`
   - 勾选 **发送域名**

### 步骤 7：配置 SSL 证书

1. 进入 **网站** → 选择网站 → **SSL**
2. 选择 **Let's Encrypt** 免费证书
3. 申请并开启 **强制 HTTPS**

### 步骤 8：配置防火墙

1. 进入 **安全**
2. 放行端口 3000（如果未使用反向代理）
3. 或只开放 80/443 端口（使用反向代理时）

---

## 🔧 方案三：纯命令行部署（Docker）

### 使用 Docker Compose 部署

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  video-platform:
    image: node:18-alpine
    container_name: video-platform
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    command: sh -c "npm install && npm start"
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=3000
```

部署命令：

```bash
# 克隆项目
git clone https://github.com/lorryjovens-hub/video-platform.git
cd video-platform

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 🔧 方案四：纯命令行部署（Systemd）

### 步骤 1：安装 Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo -E bash -
sudo yum install -y nodejs
```

### 步骤 2：克隆项目

```bash
cd /opt
git clone https://github.com/lorryjovens-hub/video-platform.git
cd video-platform
npm install
```

### 步骤 3：创建 Systemd 服务

```bash
sudo nano /etc/systemd/system/video-platform.service
```

添加以下内容：

```ini
[Unit]
Description=Video Platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/video-platform
ExecStart=/usr/bin/node proxy-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### 步骤 4：启动服务

```bash
# 重载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start video-platform

# 设置开机启动
sudo systemctl enable video-platform

# 查看状态
sudo systemctl status video-platform

# 查看日志
sudo journalctl -u video-platform -f
```

### 步骤 5：配置 Nginx 反向代理

```bash
sudo nano /etc/nginx/sites-available/video-platform
```

添加配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/video-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 步骤 6：配置防火墙

```bash
# Ubuntu (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# CentOS (Firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 📊 性能优化建议

### 1. 启用 Gzip 压缩

**Nginx 配置：**

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/json application/javascript;
```

### 2. 配置浏览器缓存

**Nginx 配置：**

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用 PM2 管理进程（可选）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start proxy-server.js --name video-platform

# 设置开机启动
pm2 startup
pm2 save
```

---

## 🔍 故障排查

### 问题 1：无法访问网站

```bash
# 检查服务状态
systemctl status video-platform

# 检查端口监听
netstat -tlnp | grep 3000

# 检查防火墙
iptables -L -n | grep 3000
# 或
ufw status
```

### 问题 2：Node.js 进程崩溃

```bash
# 查看日志
journalctl -u video-platform -f

# 或 PM2 日志
pm2 logs video-platform
```

### 问题 3：CORS 错误

确保 `proxy-server.js` 中已配置 CORS：

```javascript
app.use(cors());
```

---

## 📝 常用命令速查

| 操作 | 命令 |
| --- | --- |
| 启动服务 | `systemctl start video-platform` |
| 停止服务 | `systemctl stop video-platform` |
| 重启服务 | `systemctl restart video-platform` |
| 查看状态 | `systemctl status video-platform` |
| 查看日志 | `journalctl -u video-platform -f` |
| 开机启动 | `systemctl enable video-platform` |
| 禁用开机启动 | `systemctl disable video-platform` |

---

## 📞 技术支持

如遇到问题，请检查：
1. 服务器日志
2. Node.js 版本兼容性
3. 防火墙配置
4. 端口占用情况