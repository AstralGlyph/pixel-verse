# 开源准备工作实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 清理开发文件、添加开源文档，使项目达到可直接开源发布的状态。

**Architecture:** 通过文件系统操作和文档编写完成，不涉及代码逻辑变更。分为清理、新增文档、更新文档三个维度。

**Tech Stack:** 无（纯文件操作）

---

### Task 1: 编写 LICENSE 文件

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: 创建 MIT License 文件**

创建标准的 MIT License 文件，版权所有者为 AstralGlyph。

```
MIT License

Copyright (c) 2026 AstralGlyph

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: 验证文件**

确认 `LICENSE` 文件内容正确。

---

### Task 2: 更新 .gitignore

**Files:**
- Modify: `.gitignore`

当前 `.gitignore` 内容（已修改但未提交）：

```
# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
.astro/
build/

# Environment
.env
.env.*
!.env.example

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output/

# Cache
.cache/
.parcel-cache/
.eslintcache

# TypeScript
*.tsbuildinfo

# Playwright
test-results/
playwright-report/

# Misc
*.local
.temp/
.tmp/
```

- [ ] **Step 1: 在 .gitignore 末尾追加新规则**

在文件末尾追加以下内容：

```
# Database
data/

# Development tool directories
.playwright-mcp/
.superbrains/
.superpowers/
.specify/

# Development screenshots
*.png
!public/**/*.png

# Development scripts
debug-preview.cjs
*.bak
*.bak2
```

注意：`!public/**/*.png` 用于排除 `public/images/` 下的正常资源图片，只忽略根目录截图。

---

### Task 3: 删除开发残留文件

**Files to delete:**
- `data/cms.db`
- `data/blog.db`
- `data/pixel-verse.db`
- `.playwright-mcp/`
- `.superbrains/`
- `.superpowers/`
- `.specify/`
- `test-results/`
- `playwright-report/`
- `debug-preview.cjs`（如存在）
- `src/lib/services/post.service.ts.bak`
- `src/lib/services/post.service.ts.bak2`

- [ ] **Step 1: 删除数据库文件**

```bash
rm -f data/cms.db data/blog.db data/pixel-verse.db
```

- [ ] **Step 2: 删除开发工具目录**

```bash
rm -rf .playwright-mcp/ .superbrains/ .superpowers/ .specify/
```

- [ ] **Step 3: 删除测试产物**

```bash
rm -rf test-results/ playwright-report/
```

- [ ] **Step 4: 删除开发脚本和备份文件**

```bash
rm -f debug-preview.cjs src/lib/services/post.service.ts.bak src/lib/services/post.service.ts.bak2
```

- [ ] **Step 5: 验证清理结果**

```bash
ls -la data/
ls -la | grep -E '\.(png|bak)'
ls -d .playwright-mcp .superbrains .superpowers .specify test-results playwright-report 2>/dev/null || echo "清理完成"
```

预期输出：
- `data/` 目录存在但为空（或不存在）
- 无 `.png`、`.bak` 文件在根目录
- 开发工具目录已删除

---

### Task 4: 重写 README.md

**Files:**
- Modify: `README.md`

当前 README 仅 2 行内容。需要重写为完整的开源文档。

- [ ] **Step 1: 创建新的 README.md**

完整内容如下：

```markdown
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

### 安装

```bash
# 1. 克隆仓库
git clone https://github.com/AstralGlyph/pixel-verse.git
cd pixel-verse

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，修改数据库路径和管理员账号

# 4. 初始化数据库
node scripts/db-migrate.mjs

# 5. 插入种子数据（可选）
node scripts/db-seed.mjs

# 6. 启动开发服务器
pnpm dev
```

访问 http://localhost:4321 查看效果。管理员后台访问 http://localhost:4321/admin。

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
| `pnpm test` | 运行单元测试 |
| `pnpm test:e2e` | 运行 E2E 测试 |
| `pnpm lint` | 运行代码检查 |
| `pnpm format` | 格式化代码 |
| `node scripts/db-migrate.mjs` | 数据库迁移 |
| `node scripts/db-seed.mjs` | 插入种子数据 |

## 🚢 部署

### Vercel 部署

1. Fork 本仓库
2. 在 Vercel 导入项目
3. 设置环境变量（参考配置说明）
4. 部署即可

### 自托管部署

```bash
# 构建生产版本
pnpm build

# 启动服务
node scripts/dev.mjs
```

推荐使用 PM2 或 systemd 管理服务进程。

## 📝 贡献指南

欢迎提交 Issue 和 Pull Request！详情请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

[MIT License](./LICENSE)

## 👤 作者

**AstralGlyph**
```

- [ ] **Step 2: 验证 README 链接**

确认 README 中引用的文件路径和链接都正确（如 CONTRIBUTING.md、LICENSE）。

---

### Task 5: 增强 CONTRIBUTING.md

**Files:**
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: 更新 CONTRIBUTING.md**

在现有内容基础上，补充以下内容到文件末尾：

```markdown
## 代码规范

### 提交规范

我们遵循 Conventional Commits 规范，提交消息格式如下：

```
<type>(<scope>): <description>

[optional body]
```

常用 type：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构（既不是新功能也不是 bug 修复）
- `test`: 测试相关
- `chore`: 构建/辅助工具变更

示例：
```
feat(admin): 添加文章批量删除功能
fix(ssr): 修复文章详情页 404 问题
docs(readme): 更新部署指南
```

### Pull Request 指南

创建 PR 时请确保：

- [ ] 代码能通过 `pnpm lint` 检查
- [ ] 相关测试已通过（`pnpm test`、`pnpm test:e2e`）
- [ ] PR 描述清晰，说明变更内容和影响
- [ ] 如有截图需求，请附上前后对比图

### Issue 模板

#### Bug 报告

请包含：
- 问题描述和复现步骤
- 预期行为和实际行为
- 环境信息（Node.js 版本、操作系统、浏览器）
- 相关截图或日志

#### 功能建议

请包含：
- 功能描述和使用场景
- 预期的行为
- 是否有类似实现可以参考
```

---

### Task 6: 提交所有变更

- [ ] **Step 1: 检查最终状态**

```bash
git status
```

确认：
- LICENSE 文件已添加
- README.md 已更新
- CONTRIBUTING.md 已增强
- .gitignore 已更新
- 开发残留文件已删除
- 无敏感文件泄漏

- [ ] **Step 2: 提交变更**

```bash
# 暂存所有变更
git add LICENSE README.md CONTRIBUTING.md .gitignore
git add -u  # 暂存已删除文件的变更
git add -A  # 暂存所有新文件

git commit -m "$(cat <<'EOF'
chore: 开源准备工作 — 清理开发文件，添加开源文档

- 添加 MIT License
- 重写 README.md（快速开始、配置、部署指南）
- 增强 CONTRIBUTING.md（提交规范、PR 指南、Issue 模板）
- 更新 .gitignore（排除数据库、开发工具、截图、备份文件）
- 清理开发残留（.playwright-mcp, .superpowers, .specify, .superbrains, test-results 等）

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: 验证提交**

```bash
git log -1 --stat
```

确认提交包含所有预期变更文件。

---

## 自审

### 1. 规范覆盖检查

对照设计文档 `2026-04-11-open-source-prep-design.md` 逐项检查：

| 设计文档要求 | 对应 Task | 状态 |
|-------------|-----------|------|
| 编写 LICENSE 文件 | Task 1 | ✅ |
| 重写 README.md | Task 4 | ✅ |
| 更新 .gitignore | Task 2 | ✅ |
| 删除清理清单文件 | Task 3 | ✅ |
| 增强 CONTRIBUTING.md | Task 5 | ✅ |
| 提交所有变更 | Task 6 | ✅ |
| 仓库名 pixel-verse | 设计文档 | ✅ |
| 作者 AstralGlyph | Task 1, Task 4 | ✅ |
| MIT License | Task 1 | ✅ |
| 文档语言中文 | 全部 | ✅ |

### 2. 占位符扫描

计划中无 "TBD"、"TODO"、"implement later" 等占位符。每个步骤都包含完整文件内容和命令。

### 3. 类型一致性

本计划不涉及代码签名或类型定义，无类型一致性问题。
