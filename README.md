# Pixel-Verse

开箱即用的个人博客系统模板，附带后台 CMS 管理功能。基于 Astro 构建，融合交互式叙事和 AI 增强体验。

## ✨ 核心特性

- **前台博客站点** — 文章展示、项目展示、标签分类、全文搜索、评论系统
- **后台 CMS 管理** — 文章 CRUD、项目管理、分类标签、媒体库、用户管理、审计日志
- **响应式设计** — 移动端适配，深色/浅色主题自动切换
- **代码展示** — Shiki 语法高亮 + Sandpack 可交互代码沙箱
- **SEO 优化** — RSS 订阅、Sitemap、Open Graph、结构化数据

## 🚀 快速开始

### 前置条件

- Node.js >= 20 LTS
- pnpm >= 9

### 方式一：一键安装（推荐）

```bash
# 克隆仓库
git clone https://github.com/AstralGlyph/pixel-verse.git
cd pixel-verse

# 一键安装：检查环境、安装依赖、配置环境变量、初始化数据库
bash setup.sh
```

### 方式二：手动安装

```bash
# 1. 克隆仓库
git clone https://github.com/AstralGlyph/pixel-verse.git
cd pixel-verse

# 2. 安装依赖（自动编译原生模块）
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，修改数据库路径和管理员账号

# 4. 初始化数据库
pnpm db:migrate

# 5. 插入种子数据（可选）
pnpm db:seed

# 6. 启动开发服务器
pnpm dev
```

访问 http://localhost:4321 查看效果。管理员后台访问 http://localhost:4321/admin。

### 重置数据库

如需完全重置数据库（删除旧数据 + 重新初始化）：

```bash
pnpm db:reset
```

## ⚙️ 配置说明

复制 `.env.example` 为 `.env.local` 后配置以下变量：

| 变量 | 必填 | 说明 |
|------|------|------|
| `SITE_URL` | 是 | 站点地址，开发环境为 `http://localhost:4321` |
| `GISCUS_REPO` | 否 | GitHub 仓库路径，用于 Giscus 评论（如 `owner/repo`） |
| `GISCUS_REPO_ID` | 否 | Giscus 仓库 ID |
| `GISCUS_CATEGORY` | 否 | Giscus 讨论分类名称 |
| `GISCUS_CATEGORY_ID` | 否 | Giscus 讨论分类 ID |
| `NEWSLETTER_API_KEY` | 否 | Newsletter 服务 API Key |
| `ANALYTICS_ID` | 否 | 网站分析工具 ID |
| `DATABASE_URL` | 是 | 数据库路径，如 `file:./data/cms.db` |
| `SESSION_SECRET` | 是 | 会话加密密钥（随机字符串） |
| `ADMIN_USERNAME` | 是 | 初始管理员用户名 |
| `ADMIN_PASSWORD` | 是 | 初始管理员密码（首次登录后请立即修改） |
| `ADMIN_EMAIL` | 是 | 初始管理员邮箱 |

## 📁 项目结构

```
pixel-verse/
├── src/
│   ├── admin/                    # 后台管理 React 组件
│   │   ├── components/           # 通用组件
│   │   ├── pages/                # 页面组件
│   │   ├── stores/               # Zustand 状态管理
│   │   └── types/                # TypeScript 类型
│   ├── api/                      # API 路由辅助模块
│   ├── components/               # 前台共享组件
│   │   ├── code/                 # 代码展示组件
│   │   ├── interactive/          # 交互式组件（搜索、字体、主题等）
│   │   ├── layout/               # 布局组件
│   │   ├── seo/                  # SEO 组件
│   │   ├── social/               # 社交组件
│   │   └── ui/                   # UI 基础组件
│   ├── content/                  # 内容集合配置
│   ├── layouts/                  # Astro 布局
│   ├── lib/
│   │   ├── db/                   # 数据库（schema, 连接）
│   │   ├── services/             # 业务逻辑服务层
│   │   └── utils/                # 工具函数
│   ├── pages/
│   │   ├── admin/                # 后台 Astro 页面
│   │   ├── api/                  # API 路由
│   │   └── blog/                 # 前台博客页面
│   └── middleware.ts             # 认证中间件
├── scripts/                      # 工具脚本
├── public/                       # 静态资源
└── tests/                        # 测试文件
```

## 🛠️ 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 (localhost:4321) |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm db:migrate` | 创建/更新数据库表 |
| `pnpm db:seed` | 插入种子数据（角色、管理员、分类、标签） |
| `pnpm db:reset` | 重置数据库（删除重建 + 种子数据） |
| `pnpm test` | 运行单元测试 |
| `pnpm test:e2e` | 运行 E2E 测试 |
| `pnpm lint` | 运行代码检查 |
| `pnpm format` | 格式化代码 |
| `bash setup.sh` | 一键安装初始化（依赖 + 配置 + 数据库） |

## 🚢 部署

### Vercel 部署

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 设置环境变量（参考配置说明）
4. 部署即可

### 自托管部署

```bash
# 安装依赖并初始化
pnpm install
pnpm db:migrate
pnpm db:seed

# 构建并启动
pnpm build
pnpm start
```

推荐使用 PM2 或 systemd 管理服务进程。

## 📝 贡献指南

欢迎提交 Issue 和 Pull Request！详情请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

[MIT License](./LICENSE)

## 👤 作者

**AstralGlyph**
