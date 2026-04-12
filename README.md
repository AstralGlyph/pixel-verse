# Pixel-Verse

开箱即用的个人博客系统，附带后台 CMS 管理。基于 Astro + React 构建。

## ✨ 核心特性

- **前台博客** — 文章展示、标签分类、全文搜索、评论系统、RSS 订阅
- **后台 CMS** — 文章/项目管理、分类标签、媒体库、用户权限、审计日志
- **响应式** — 移动端适配，深色/浅色主题自动切换
- **代码展示** — Shiki 语法高亮 + Sandpack 可交互代码沙箱
- **SEO** — Sitemap、Open Graph、结构化数据

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/AstralGlyph/pixel-verse.git
cd pixel-verse
```

### 2. 安装并启动（一条命令）

```bash
bash setup.sh
```

脚本会自动：检查 Node.js → 安装 pnpm → 安装依赖 → 创建配置 → 初始化数据库 → 启动开发服务器

启动后访问：
- 前台博客：http://localhost:4321
- 后台管理：http://localhost:4321/admin

### 3. 日常使用

之后只需一条命令即可启动：

```bash
bash start.sh
```

> **前置条件：** Node.js >= 20 LTS。如果未安装，请先访问 [nodejs.org](https://nodejs.org/) 下载。

## ⚙️ 配置

脚本会自动从 `.env.example` 创建 `.env.local`。主要变量：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | 数据库路径，默认 `file:./data/cms.db` |
| `SESSION_SECRET` | 会话加密密钥（随机字符串） |
| `ADMIN_USERNAME` | 初始管理员用户名 |
| `ADMIN_PASSWORD` | 初始管理员密码 |
| `ADMIN_EMAIL` | 初始管理员邮箱 |
| `SITE_URL` | 站点地址 |
| `GISCUS_*` | Giscus 评论配置（可选） |

编辑 `.env.local` 后重启服务即可生效。

## 🚢 部署

### Render 一键部署

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AstralGlyph/pixel-verse)

点击按钮后按提示操作，需手动填写以下环境变量：

| 变量 | 示例 | 说明 |
|------|------|------|
| `DATABASE_URL` | `file:./data/cms.db` | SQLite 数据库路径 |
| `ADMIN_USERNAME` | `admin` | 管理员用户名 |
| `ADMIN_PASSWORD` | 强密码 | 管理员密码 |
| `ADMIN_EMAIL` | `admin@example.com` | 管理员邮箱 |
| `SITE_URL` | `https://你的应用名.onrender.com` | 部署后的站点地址 |

`SESSION_SECRET` 会自动生成，无需手动填写。

### 手动部署到 Render

1. Fork 本仓库
2. 在 [Render Dashboard](https://dashboard.render.com) 新建 Web Service
3. 导入你的仓库，填写配置：

| 配置项 | 值 |
|--------|-----|
| Build Command | `pnpm install && pnpm build` |
| Start Command | `node scripts/db-migrate.mjs && node scripts/db-seed.mjs && node scripts/start-server.mjs` |
| Runtime | Node |
| Plan | Free |

4. **添加持久化磁盘**（必须，否则数据会丢失）：
   - Name: `sqlite-data`
   - Mount Path: `/opt/render/project/src/data`
   - Size: `1 GB`

5. 添加环境变量（同上表）

### 自托管部署

```bash
# 一键安装并启动生产服务器
bash setup.sh --start

# 或手动分步
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm start:prod
```

推荐使用 PM2 或 systemd 管理进程。

### 注意事项

- **冷启动**：Render Free 计划 15 分钟无请求后会休眠，下次访问需约 30 秒唤醒
- **媒体文件**：上传的图片存储在 `public/uploads/`，Render 上需持久化整个项目目录或使用 S3/R2 等对象存储
- **数据库备份**：在 Render Dashboard → Disks → 点击磁盘 → Download 可下载 SQLite 文件

## 🛠️ 可用命令

| 命令 | 说明 |
|------|------|
| `bash setup.sh` | 一键安装并启动开发服务器 |
| `bash setup.sh --start` | 安装并启动生产服务器 |
| `bash start.sh` | 快速启动开发服务器 |
| `pnpm dev` | 开发模式 |
| `pnpm build` | 构建生产版本 |
| `pnpm start:prod` | 构建并启动生产服务器 |
| `pnpm db:reset` | 重置数据库 |
| `pnpm lint` | 代码检查 |
| `pnpm format` | 格式化代码 |

## 📁 项目结构

```
pixel-verse/
├── src/
│   ├── admin/          # 后台管理 React 组件
│   ├── components/     # 前台共享组件
│   ├── lib/
│   │   ├── db/         # 数据库（schema, 连接）
│   │   └── services/   # 业务逻辑服务层
│   ├── pages/
│   │   ├── admin/      # 后台页面
│   │   ├── api/        # API 路由
│   │   └── blog/       # 前台博客
│   └── middleware.ts   # 认证中间件
├── scripts/            # 工具脚本
└── public/             # 静态资源
```

## 📝 贡献

欢迎提交 Issue 和 Pull Request！详情请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

[MIT License](./LICENSE)
