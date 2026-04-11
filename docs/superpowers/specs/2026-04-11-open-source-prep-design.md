# 开源设计文档: Pixel-Verse

**创建时间**: 2026-04-11
**作者**: AstralGlyph
**状态**: 已批准

---

## 1. 项目定位

开箱即用的个人博客系统模板，附带后台 CMS 管理功能。面向希望快速搭建个人博客的开发者，提供完整的前台展示和后台管理能力。

### 技术栈

- **前端框架**: Astro 5.x (SSR) + React 18.x
- **样式**: Tailwind CSS v4 + Framer Motion
- **富文本编辑器**: TipTap v3
- **数据库**: Better SQLite3 + Drizzle ORM
- **搜索**: Pagefind
- **代码展示**: Shiki + Sandpack
- **状态管理**: Zustand

### 核心特性

- 前台博客站点（文章展示、项目展示、标签分类、全文搜索、评论系统）
- 后台 CMS 管理（文章 CRUD、项目管理、分类标签、媒体库、用户管理）
- 响应式设计 + 深色/浅色主题
- 代码块高亮 + 可交互代码沙箱
- RSS 订阅 + SEO 优化

---

## 2. 仓库信息

| 项目 | 值 |
|------|------|
| 仓库名 | `pixel-verse` |
| 许可证 | MIT |
| 作者 | AstralGlyph |
| 文档语言 | 纯中文 |
| 分支策略 | `master` 为主分支，功能开发在 `feat/*` 分支 |

---

## 3. 清理清单

### 3.1 删除的文件/目录

| 类型 | 路径 | 原因 |
|------|------|------|
| 截图 | 根目录所有 `.png` 文件 (~25 个) | 开发过程截图 |
| 数据库 | `data/*.db` | 运行时数据，已在 .gitignore |
| E2E 缓存 | `.playwright-mcp/` | Playwright MCP 缓存 |
| 测试结果 | `test-results/` | 测试运行产物 |
| 测试报告 | `playwright-report/` | 测试运行产物 |
| 工具目录 | `.superbrains/` | 开发工具内部数据 |
| 工具目录 | `.superpowers/` | 开发工具内部数据 |
| 工具目录 | `.specify/` | 开发工具内部数据 |
| 调试脚本 | `debug-preview.cjs` | 开发调试脚本 |

### 3.2 保留的文件

| 路径 | 说明 |
|------|------|
| `.claude/` | Claude Code 配置（包含项目规则和工具配置） |
| `docs/superpowers/` | 设计文档和实现计划 |
| `CLAUDE.md` | 完全保留（项目开发规则） |
| `CONTRIBUTING.md` | 保留并增强 |
| `.env.example` | 保留（已是安全的占位符格式） |
| `seed 脚本` | 保留（使用环境变量，无硬编码敏感信息） |

---

## 4. 文档变更

### 4.1 README.md 重写

当前 README 仅有 2 行，需要重写为完整的开源文档。结构如下：

1. **项目简介** — 一句话描述 + 核心特性列表
2. **快速开始** — 3 步启动：克隆 → 安装依赖 → 启动
3. **配置说明** — `.env.example` 各字段说明
4. **项目结构** — 目录树
5. **可用命令** — 常用 npm scripts
6. **部署指南** — Vercel / 自托管方式
7. **技术栈** — 使用的技术和框架
8. **许可证 & 作者** — MIT License, AstralGlyph

### 4.2 LICENSE 新增

MIT License，版权所有者: AstralGlyph

### 4.3 .gitignore 更新

新增忽略规则：
- `data/` — 数据库文件
- `*.png` — 截图（根目录）
- `.playwright-mcp/`
- `test-results/`
- `playwright-report/`
- `.superbrains/`
- `.superpowers/`
- `.specify/`
- `debug-preview.cjs`

### 4.4 CONTRIBUTING.md 增强

补充：
- 本地开发环境准备步骤
- 代码规范和提交规范
- Issue 和 PR 模板指引

---

## 5. 安全审查

### 5.1 敏感数据检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| `.env.local` | ✅ 已在 .gitignore | 不会被提交 |
| `.env.example` | ✅ 安全 | 全是占位符，无真实密钥 |
| seed 脚本 | ✅ 安全 | 使用环境变量，无硬编码密码 |
| 数据库文件 | ✅ 需删除 | 可能包含种子数据 |
| API 密钥 | ✅ 无硬编码 | GISCUS、NEWSLETTER 等均为环境变量 |

### 5.2 权限审查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 第三方服务 | ✅ 安全 | Giscus 评论系统仅需配置 repo ID |
| 外部依赖 | ⚠️ 需检查 | pnpm-lock.yaml 中的依赖版本锁定正常 |

---

## 6. 执行步骤

1. 编写 LICENSE 文件
2. 重写 README.md
3. 更新 .gitignore
4. 删除清理清单中的文件/目录
5. 增强 CONTRIBUTING.md（可选，视工作量而定）
6. 提交所有变更
