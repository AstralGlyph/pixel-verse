# Render 部署指南

## 前置条件

- 已有 [Render](https://render.com) 账号
- 项目已推送到 GitHub/GitLab/Bitbucket

## 部署步骤

### 1. 创建 Web Service

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 **New +** → **Web Service**
3. 选择你的 Git 仓库
4. 填写配置：

| 配置项 | 值 |
|--------|-----|
| Name | `pixel-verse`（自定义） |
| Region | Oregon（或就近区域） |
| Branch | `master` |
| Root Directory | 留空 |
| Runtime | `Node` |
| Build Command | `pnpm install && pnpm build && node scripts/db-migrate.mjs && node scripts/db-seed.mjs` |
| Start Command | `node dist/server/entry.mjs` |
| Plan | **Free** |

### 2. 配置持久化磁盘（必需）

在 Web Service 设置页面中：

1. 滚动到 **Disks** 部分
2. 点击 **Add Disk**
3. 配置：
   - Name: `sqlite-data`
   - Mount Path: `/opt/render/project/src/data`
   - Size: `1 GB`

> 这一步至关重要！SQLite 数据库文件必须存储在持久化磁盘中，否则每次部署后数据会丢失。

### 3. 设置环境变量

在 Web Service 的 **Environment** 页面添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产环境 |
| `DATABASE_URL` | `file:./data/cms.db` | 数据库路径 |
| `SESSION_SECRET` | （随机字符串） | 会话加密密钥 |
| `ADMIN_USERNAME` | `admin` | 初始管理员用户名 |
| `ADMIN_PASSWORD` | （强密码） | 初始管理员密码 |
| `ADMIN_EMAIL` | `admin@example.com` | 初始管理员邮箱 |
| `SITE_URL` | `https://你的应用名.onrender.com` | 站点 URL |

> `SESSION_SECRET` 可以使用 Render 的 "Generate" 功能自动生成随机值。

### 4. 部署

点击 **Create Web Service**，Render 会自动：

1. 拉取代码
2. 安装依赖
3. 构建项目
4. 运行数据库迁移和种子脚本
5. 启动服务

首次部署大约需要 3-5 分钟。部署完成后，访问 Render 提供的域名即可。

## 使用 render.yaml 一键部署

项目根目录已包含 [render.yaml](render.yaml)，支持一键部署：

1. 访问：`https://render.com/deploy?repo=你的仓库URL`
2. 或者在 Render Dashboard 中导入蓝图

## 注意事项

### 冷启动

Free 计划的服务在 15 分钟无请求后会休眠。下次访问时会触发冷启动，大约需要 30 秒。如需避免：

- 升级到 Starter 计划（$7/月）
- 使用外部监控服务定期 ping 站点保持活跃

### 媒体文件

上传的图片等媒体文件存储在 `public/uploads/`。当前 `render.yaml` 仅挂载了 `data/` 目录用于持久化 SQLite 数据库。

**方案一：持久化整个项目目录（推荐）**

将磁盘挂载路径改为 `/opt/render/project/src`，这样 `public/uploads/` 也会被持久化。但需要注意首次部署时媒体目录为空，不会影响运行。

**方案二：使用外部对象存储**

对于生产环境，建议将媒体文件存储迁移到 Cloudflare R2、AWS S3 等对象存储服务，更可靠且易于备份。

### 数据库备份

SQLite 文件可以直接下载备份：

1. 在 Render Dashboard 中打开 Web Service
2. 进入 **Disks** → 点击磁盘 → **Download**

或使用 SSH 连接后手动复制 `data/cms.db`。

### 更新代码

每次推送到 `master` 分支后，Render 会自动触发重新部署。数据库迁移会在构建阶段自动运行，不会丢失现有数据。
