# Tasks: PixelVerse 个人博客系统

**Input**: 设计文档来自 `/specs/001-pixelverse-blog/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 本项目遵循 TDD（测试驱动开发）原则，包含单元测试和集成测试任务。

**Organization**: 任务按用户故事组织，每个故事可独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属用户故事（如 US1, US2, US3）
- 描述中包含精确文件路径

## Path Conventions

- **项目类型**: Web Application (SSG + Islands Architecture)
- **源码目录**: `src/`
- **测试目录**: `tests/`
- **内容目录**: `src/content/`
- **配置文件**: 项目根目录

---

## Phase 1: Setup (项目初始化)

**Purpose**: 创建项目基础结构和配置

- [X] T001 创建 Astro 项目并配置 TypeScript strict 模式
- [X] T002 [P] 安装核心依赖：@astrojs/mdx, @astrojs/react, @astrojs/tailwind, @astrojs/sitemap
- [X] T003 [P] 安装 React 依赖：react, react-dom, @types/react, @types/react-dom
- [X] T004 [P] 安装样式依赖：tailwindcss, @tailwindcss/typography
- [X] T005 [P] 安装代码相关依赖：shiki, @codesandbox/sandpack-react
- [X] T006 [P] 安装动画依赖：framer-motion
- [X] T007 [P] 安装搜索依赖：pagefind
- [X] T008 [P] 安装工具依赖：date-fns, reading-time, gray-matter
- [X] T009 [P] 安装测试依赖：vitest, @testing-library/react, @playwright/test, jsdom
- [X] T010 配置 astro.config.mjs（集成 MDX, React, Tailwind, Sitemap）
- [X] T011 配置 tsconfig.json（设置路径别名 @/*, @components/*, @layouts/*）
- [X] T012 [P] 配置 tailwind.config.mjs（CSS 变量主题、typography 插件）
- [X] T013 [P] 创建目录结构：src/components/{ui,code,layout,interactive,social}
- [X] T014 [P] 创建目录结构：src/layouts, src/pages, src/content, src/data, src/styles, src/utils
- [X] T015 [P] 创建测试目录：tests/unit, tests/integration, tests/e2e
- [X] T016 [P] 创建静态资源目录：public/fonts, public/images/{og,blog}
- [X] T017 配置 vitest.config.ts（单元测试环境）
- [X] T018 [P] 配置 playwright.config.ts（E2E 测试环境）
- [X] T019 [P] 配置 package.json 脚本：dev, build, preview, test, test:e2e, lint, format
- [X] T020 [P] 配置 .gitignore（node_modules, dist, .astro, .env）

**Checkpoint**: ✅ 项目骨架创建完成，可以启动开发服务器

---

## Phase 2: Foundational (基础设施)

**Purpose**: 核心基础设施，所有用户故事的前置依赖

**⚠️ CRITICAL**: 此阶段必须完成后才能开始任何用户故事实现

### 内容集合与数据层

- [X] T021 创建 src/content/config.ts 定义 blog 内容集合 Schema
- [X] T022 [P] 创建 src/content/schema.ts 导出 Frontmatter Zod Schema
- [X] T023 [P] 创建 src/data/author.json 存储作者档案信息
- [X] T024 [P] 创建 src/data/social.json 存储社交链接配置
- [X] T025 [P] 创建 src/data/navigation.json 存储导航配置
- [X] T026 [P] 创建 src/data/status.json 存储"当前正在做什么"状态

### 全局样式与主题系统

- [X] T027 创建 src/styles/global.css 导入 Tailwind 和基础样式
- [X] T028 [P] 创建 src/styles/themes/dark.css 定义暗色主题 CSS 变量
- [X] T029 [P] 创建 src/styles/themes/light.css 定义亮色主题 CSS 变量
- [X] T030 [P] 创建 src/styles/typography.css 定义文章排版样式

### 工具函数

- [X] T031 创建 src/utils/date.ts 日期格式化工具
- [X] T032 [P] 创建 src/utils/reading-time.ts 阅读时间计算工具
- [X] T033 [P] 创建 src/utils/seo.ts SEO 元信息生成工具
- [X] T034 [P] 创建 src/utils/content.ts 内容处理工具

### 基础布局

- [X] T035 创建 src/layouts/BaseLayout.astro 基础页面布局
- [X] T036 [P] 创建 src/components/layout/Header/Header.astro 导航栏组件
- [X] T037 [P] 创建 src/components/layout/Footer/Footer.astro 页脚组件
- [X] T038 [P] 创建 src/components/layout/SkipLink.astro 无障碍跳转链接

### 单元测试 - 工具函数

- [X] T039 [P] 创建 tests/unit/utils/date.test.ts 测试日期工具
- [X] T040 [P] 创建 tests/unit/utils/reading-time.test.ts 测试阅读时间计算
- [X] T041 [P] 创建 tests/unit/utils/seo.test.ts 测试 SEO 工具

**Checkpoint**: ✅ 基础设施就绪，可以开始用户故事实现

---

## Phase 3: User Story 1 - 阅读沉浸式文章内容 (Priority: P1) 🎯 MVP

**Goal**: 读者可以阅读包含交互式元素的文章，享受流畅的阅读体验

**Independent Test**: 访问任意包含交互组件的文章页面，验证 MDX 渲染、代码高亮、阅读进度条、目录导航正常工作

### 测试 - User Story 1

- [X] T042 [P] [US1] 创建 tests/unit/components/ui/Callout.test.tsx 测试 Callout 组件（待实现）
- [X] T043 [P] [US1] 创建 tests/unit/components/ui/Tabs.test.tsx 测试 Tabs 组件（待实现）
- [X] T044 [P] [US1] 创建 tests/unit/components/code/CodeBlock.test.tsx 测试 CodeBlock 组件（待实现）
- [X] T045 [P] [US1] 创建 tests/e2e/reading.spec.ts 测试文章阅读流程（待实现）

### UI 组件

- [X] T046 [P] [US1] 创建 src/components/ui/Callout/Callout.tsx 提示框组件
- [X] T047 [P] [US1] 创建 src/components/ui/Callout/index.ts 导出组件
- [X] T048 [P] [US1] 创建 src/components/ui/Tabs/Tabs.tsx 标签切换组件
- [X] T049 [P] [US1] 创建 src/components/ui/Tabs/index.ts 导出组件
- [X] T050 [P] [US1] 创建 src/components/ui/Accordion/Accordion.tsx 折叠组件
- [X] T051 [P] [US1] 创建 src/components/ui/Accordion/index.ts 导出组件

### 代码组件

- [X] T052 [US1] 创建 src/components/code/CodeBlock/CodeBlock.astro 静态代码块组件
- [X] T053 [P] [US1] 创建 src/components/code/CodePlayground/CodePlayground.tsx 代码游乐场组件
- [X] T054 [P] [US1] 创建 src/components/code/CodePlayground/index.ts 导出组件
- [X] T055 [P] [US1] 创建 src/components/code/SandpackEmbed/SandpackEmbed.tsx Sandpack 嵌入组件
- [X] T056 [P] [US1] 创建 src/components/code/SandpackEmbed/index.ts 导出组件

### 布局组件

- [X] T057 [US1] 创建 src/components/layout/TOC/TOC.tsx 目录导航组件
- [X] T058 [P] [US1] 创建 src/components/layout/TOC/index.ts 导出组件
- [X] T059 [US1] 创建 src/components/layout/ReadingProgress/ReadingProgress.tsx 阅读进度条
- [X] T060 [P] [US1] 创建 src/components/layout/ReadingProgress/index.ts 导出组件

### 文章页面

- [X] T061 [US1] 创建 src/layouts/PostLayout.astro 文章页布局
- [X] T062 [US1] 创建 src/pages/blog/[...slug].astro 文章详情页路由
- [X] T063 [US1] 创建示例文章 src/content/blog/welcome-to-pixelverse.mdx（包含各种交互组件）

### 集成测试

- [X] T064 [US1] 创建 tests/integration/content/mdx-rendering.test.ts 测试 MDX 渲染（待实现）

**Checkpoint**: ✅ User Story 1 完成，文章阅读功能独立可用

---

## Phase 4: User Story 2 - 快速发现和查找内容 (Priority: P1)

**Goal**: 读者可以通过 Command Palette 快速搜索和导航全站内容

**Independent Test**: 按 Cmd/Ctrl+K 唤起命令面板，验证模糊搜索、快捷命令、键盘导航正常工作

### 测试 - User Story 2

- [X] T065 [P] [US2] 创建 tests/unit/components/interactive/CommandPalette.test.tsx（待实现）
- [X] T066 [P] [US2] 创建 tests/e2e/command-palette.spec.ts 测试命令面板流程（待实现）

### 搜索组件

- [X] T067 [US2] 创建 src/components/interactive/Search/Search.tsx Pagefind 搜索组件
- [X] T068 [P] [US2] 创建 src/components/interactive/Search/index.ts 导出组件
- [X] T069 [US2] 创建 src/components/interactive/CommandPalette/CommandPalette.tsx 命令面板组件
- [X] T070 [P] [US2] 创建 src/components/interactive/CommandPalette/hooks/useCommands.tsx 命令钩子
- [X] T071 [P] [US2] 创建 src/components/interactive/CommandPalette/index.ts 导出组件

### 搜索索引

- [X] T072 [US2] 配置 Pagefind 集成生成搜索索引（postbuild 脚本）

**Checkpoint**: ✅ User Story 2 完成，搜索导航功能独立可用

---

## Phase 5: User Story 3 - 主题切换与视觉体验 (Priority: P1)

**Goal**: 读者可以在暗色、亮色、跟随系统三种主题模式间自由切换

**Independent Test**: 点击主题切换按钮或使用命令面板，验证三种主题正确渲染、切换动画流畅

### 测试 - User Story 3

- [X] T073 [P] [US3] 创建 tests/unit/components/interactive/ThemeToggle.test.tsx（待实现）
- [X] T074 [P] [US3] 创建 tests/e2e/theme.spec.ts 测试主题切换流程（待实现）

### 主题组件

- [X] T075 [US3] 创建 src/components/interactive/ThemeToggle/ThemeToggle.tsx 主题切换组件
- [X] T076 [P] [US3] 创建 src/components/interactive/ThemeToggle/hooks/useTheme.ts 主题钩子
- [X] T077 [P] [US3] 创建 src/components/interactive/ThemeToggle/index.ts 导出组件

### View Transitions

- [X] T078 [US3] 创建 src/scripts/view-transitions.ts View Transitions API 封装
- [X] T079 [US3] 在 BaseLayout 中集成 View Transitions 和主题切换脚本

**Checkpoint**: ✅ User Story 3 完成，主题系统独立可用

---

## Phase 6: User Story 4 - 个人品牌展示与首页体验 (Priority: P1)

**Goal**: 首页展示作者的个人品牌形象、精选文章、项目作品

**Independent Test**: 访问首页，验证 Hero Section、Bento Grid 卡片、项目展示、社交链接正常渲染

### 测试 - User Story 4

- [X] T080 [P] [US4] 创建 tests/unit/components/social/SocialLinks.test.tsx（待实现）
- [X] T081 [P] [US4] 创建 tests/e2e/homepage.spec.ts 测试首页流程（待实现）

### 首页组件

- [X] T082 [P] [US4] 创建 src/components/layout/Hero/Hero.astro Hero Section 组件
- [X] T083 [P] [US4] 创建 src/components/layout/BentoGrid/BentoGrid.tsx Bento Grid 卡片布局
- [X] T084 [P] [US4] 创建 src/components/layout/BentoGrid/index.ts 导出组件
- [X] T085 [P] [US4] 创建 src/components/layout/StatusBanner/StatusBanner.astro 全局状态栏
- [X] T086 [US4] 创建 src/components/social/SocialLinks/SocialLinks.tsx 社交链接组件
- [X] T087 [P] [US4] 创建 src/components/social/SocialLinks/index.ts 导出组件

### 首页页面

- [X] T088 [US4] 创建 src/layouts/ListLayout.astro 列表页布局
- [X] T089 [US4] 创建 src/pages/index.astro 首页

**Checkpoint**: ✅ User Story 4 完成，首页品牌展示独立可用

---

## Phase 7: User Story 10 - SEO 与性能体验 (Priority: P1)

**Goal**: 页面快速加载、SEO 优化完善，Lighthouse Performance > 95

**Independent Test**: 运行 Lighthouse 测试验证性能指标达标，检查 meta 标签、OG 图片、结构化数据正确生成

### SEO 组件

- [X] T090 [P] [US10] 创建 src/components/seo/SEO.astro SEO 元信息组件
- [X] T091 [P] [US10] 创建 src/components/seo/JsonLD.astro JSON-LD 结构化数据组件
- [X] T092 [P] [US10] 创建 src/components/seo/OGImage.astro OG 图片生成组件

### 构建优化

- [X] T093 [US10] 创建 src/hooks/og-image.ts OG 图片生成钩子
- [X] T094 [US10] 配置 astro sitemap 自动生成
- [X] T095 [US10] 创建 src/pages/rss.xml.ts RSS Feed 生成

### 性能测试

- [X] T096 [US10] 创建 tests/integration/performance/lighthouse.test.ts 性能测试

**Checkpoint**: User Story 10 完成，SEO 和性能达标

---

## Phase 8: User Story 11 - 无障碍访问 (Priority: P1)

**Goal**: WCAG 2.2 AA 级合规，所有用户可完整访问内容和功能

**Independent Test**: 使用键盘完整导航，屏幕阅读器验证语义化标记，对比度测试通过

### 无障碍组件

- [X] T097 [P] [US11] 优化 src/components/layout/SkipLink.astro 添加跳转链接
- [X] T098 [P] [US11] 创建 src/components/ui/FocusTrap/FocusTrap.tsx 焦点陷阱组件
- [X] T099 [US11] 审查并修复所有组件的 ARIA 标记

### 无障碍测试

- [X] T100 [US11] 创建 tests/e2e/accessibility.spec.ts 无障碍 E2E 测试
- [X] T101 [US11] 配置 axe-core 集成到 Playwright 测试

**Checkpoint**: User Story 11 完成，无障碍合规

---

## Phase 9: User Story 12 - 作者写作与发布流程 (Priority: P1)

**Goal**: 作者可以在本地使用 MDX 编写文章，Git 提交自动构建部署

**Independent Test**: 创建包含正确 frontmatter 的 MDX 文件，验证本地预览、构建、草稿排除功能正常

### 内容管理

- [X] T102 [US12] 完善 src/content/config.ts 添加 projects 集合
- [X] T103 [P] [US12] 创建 src/utils/frontmatter.ts frontmatter 验证工具
- [X] T104 [P] [US12] 创建 .vscode/settings.json 配置 MDX 语法支持

### 本地开发

- [X] T105 [US12] 配置 Astro 开发服务器 Hot Reload
- [X] T106 [US12] 创建脚本自动生成文章模板

### 内容测试

- [X] T107 [US12] 创建 tests/integration/content/frontmatter-validation.test.ts 测试 frontmatter 验证

**Checkpoint**: User Story 12 完成，内容发布流程可用

---

## Phase 10: User Story 5 - 博客列表浏览与筛选 (Priority: P2)

**Goal**: 读者可以浏览全部文章列表并按标签/分类筛选

**Independent Test**: 访问博客列表页，验证文章列表渲染、标签筛选、搜索功能

### 列表组件

- [X] T108 [P] [US5] 创建 src/components/layout/ArticleCard/ArticleCard.astro 文章卡片组件
- [X] T109 [P] [US5] 创建 src/components/ui/TagList/TagList.tsx 标签列表组件
- [X] T110 [P] [US5] 创建 src/components/ui/TagList/index.ts 导出组件

### 列表页面

- [X] T111 [US5] 创建 src/pages/blog/index.astro 博客列表页
- [X] T112 [US5] 创建 src/pages/tags/index.astro 标签云页
- [X] T113 [US5] 创建 src/pages/tags/[tag].astro 标签文章列表页

### 测试 - User Story 5

- [X] T114 [P] [US5] 创建 tests/e2e/blog-list.spec.ts 测试列表浏览流程

**Checkpoint**: User Story 5 完成，列表浏览筛选独立可用

---

## Phase 11: User Story 6 - 沉浸式阅读模式 (Priority: P2)

**Goal**: 读者可以一键进入沉浸式阅读模式，隐藏所有非内容元素

**Independent Test**: 点击阅读模式切换按钮，验证导航栏隐藏、内容区域扩展

### 阅读模式组件

- [X] T115 [US6] 创建 src/components/interactive/ReadingMode/ReadingMode.tsx 沉浸阅读组件
- [X] T116 [P] [US6] 创建 src/components/interactive/ReadingMode/index.ts 导出组件
- [X] T117 [P] [US6] 创建 src/components/interactive/FontControl/FontControl.tsx 字体控制组件

### 测试 - User Story 6

- [X] T118 [US6] 创建 tests/unit/components/interactive/ReadingMode.test.tsx

**Checkpoint**: User Story 6 完成，沉浸阅读独立可用

---

## Phase 12: User Story 7 - 社交互动与评论 (Priority: P2)

**Goal**: 读者可以对文章进行反应、查看阅读量、参与评论

**Independent Test**: 验证文章反应按钮、阅读量展示、Giscus 评论系统加载和交互

### 反应组件

- [X] T119 [P] [US7] 创建 src/components/social/Reactions/Reactions.tsx 文章反应组件
- [X] T120 [P] [US7] 创建 src/components/social/Reactions/hooks/useReactions.ts 反应钩子
- [X] T121 [P] [US7] 创建 src/components/social/Reactions/index.ts 导出组件
- [X] T122 [P] [US7] 创建 src/components/social/ViewCount/ViewCount.tsx 阅读量组件

### 评论组件

- [X] T123 [US7] 创建 src/components/social/GiscusComments/GiscusComments.tsx Giscus 评论组件
- [X] T124 [P] [US7] 创建 src/components/social/GiscusComments/index.ts 导出组件

### Edge Function (阅读量统计)

- [X] T125 [US7] 创建 functions/api/view-count.ts Edge Function 处理阅读量

### 测试 - User Story 7

- [X] T126 [P] [US7] 创建 tests/unit/components/social/Reactions.test.tsx
- [X] T127 [P] [US7] 创建 tests/integration/api/view-count.test.ts

**Checkpoint**: User Story 7 完成，社交互动独立可用

---

## Phase 13: User Story 8 - 文章分享与订阅 (Priority: P2)

**Goal**: 读者可以分享文章到社交平台或订阅 Newsletter

**Independent Test**: 验证分享栏展示、选中文字分享、Newsletter 订阅表单、RSS Feed 功能

### 分享组件

- [X] T128 [P] [US8] 创建 src/components/social/ShareButtons/ShareButtons.tsx 分享按钮组件
- [X] T129 [P] [US8] 创建 src/components/social/ShareButtons/index.ts 导出组件

### 订阅组件

- [X] T130 [US8] 创建 src/components/interactive/NewsletterForm/NewsletterForm.tsx 订阅表单组件
- [X] T131 [P] [US8] 创建 src/components/interactive/NewsletterForm/index.ts 导出组件

### 测试 - User Story 8

- [X] T132 [P] [US8] 创建 tests/unit/components/interactive/NewsletterForm.test.tsx

**Checkpoint**: User Story 8 完成，分享订阅独立可用

---

## Phase 14: User Story 9 - 项目展示与关于页面 (Priority: P3)

**Goal**: 读者可以浏览作者的项目作品展示和个人介绍页面

**Independent Test**: 访问 /projects 和 /about 页面，验证项目卡片、个人介绍时间线正常展示

### 项目组件

- [X] T133 [P] [US9] 创建 src/components/layout/ProjectCard/ProjectCard.astro 项目卡片组件
- [X] T134 [P] [US9] 创建 src/components/layout/Timeline/Timeline.tsx 时间线组件
- [X] T135 [P] [US9] 创建 src/components/layout/Timeline/index.ts 导出组件

### 项目数据

- [X] T136 [US9] 创建 src/content/projects/ 示例项目数据文件

### 项目页面

- [X] T137 [US9] 创建 src/pages/projects/index.astro 项目页
- [X] T138 [US9] 创建 src/pages/about/index.astro 关于页
- [X] T139 [US9] 创建 src/pages/uses/index.astro Uses 页

**Checkpoint**: User Story 9 完成，品牌展示页面独立可用

---

## Phase 15: User Story 13 - 离线阅读与 PWA 体验 (Priority: P3)

**Goal**: 读者可以在离线状态下继续阅读已访问的文章

**Independent Test**: 首次访问文章后断网，验证 Service Worker 缓存、离线页面功能

### Service Worker

- [X] T140 [US13] 创建 public/sw.js Service Worker 缓存策略
- [X] T141 [US13] 配置 Astro PWA 集成

### PWA 配置

- [X] T142 [US13] 创建 public/manifest.json Web App Manifest
- [X] T143 [US13] 创建离线回退页面组件

### 测试 - User Story 13

- [X] T144 [US13] 创建 tests/e2e/offline.spec.ts 测试离线阅读流程

**Checkpoint**: User Story 13 完成，PWA 体验独立可用

---

## Phase 16: Polish & Cross-Cutting Concerns (收尾优化)

**Purpose**: 跨故事的改进和最终优化

### 隐私与安全

- [X] T145 [P] 创建 src/pages/privacy/index.astro 隐私政策页
- [X] T146 [P] 配置 CSP 头（public/_headers）
- [X] T147 [P] 创建 public/robots.txt

### 404 页面

- [X] T148 创建创意 404 页面 src/pages/404.astro

### 文档

- [X] T149 [P] 更新 README.md 项目说明
- [X] T150 [P] 创建 CONTRIBUTING.md 贡献指南

### 最终验证

- [X] T151 运行完整测试套件验证所有功能
- [X] T152 执行 quickstart.md 验证流程
- [ ] T153 Lighthouse 性能审计（目标 > 95）
- [ ] T154 无障碍审计（目标 WCAG 2.2 AA）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-15)**: 都依赖 Foundational 完成
  - P1 用户故事可并行（如有团队资源）
  - P2 用户故事依赖 P1 核心功能
  - P3 用户故事最后完成
- **Polish (Phase 16)**: 依赖所有用户故事完成

### User Story Dependencies

- **US1 (阅读体验)**: 无其他故事依赖，可独立完成
- **US2 (搜索导航)**: 无其他故事依赖，可独立完成
- **US3 (主题切换)**: 无其他故事依赖，可独立完成
- **US4 (首页展示)**: 依赖 US1 文章组件，可独立完成
- **US5 (列表筛选)**: 依赖 US1 文章组件
- **US6 (沉浸阅读)**: 依赖 US1 阅读功能
- **US7 (社交互动)**: 依赖 US1 文章页面
- **US8 (分享订阅)**: 依赖 US1 文章页面
- **US9 (项目展示)**: 无其他故事依赖，可独立完成
- **US10 (SEO 性能)**: 无其他故事依赖，可独立完成
- **US11 (无障碍)**: 应在其他 UI 故事后进行审查
- **US12 (内容发布)**: 无其他故事依赖，可独立完成
- **US13 (离线阅读)**: 依赖 US1 文章页面

### Parallel Opportunities

- Phase 1 所有 [P] 任务可并行
- Phase 2 所有 [P] 任务可并行
- P1 用户故事（US1, US2, US3, US4, US10, US11, US12）可并行开发
- 每个用户故事内的 [P] 任务可并行

---

## Parallel Example: User Story 1

```bash
# 并行启动所有 US1 测试任务:
Task T042: "创建 tests/unit/components/ui/Callout.test.tsx"
Task T043: "创建 tests/unit/components/ui/Tabs.test.tsx"
Task T044: "创建 tests/unit/components/code/CodeBlock.test.tsx"
Task T045: "创建 tests/e2e/reading.spec.ts"

# 并行启动所有 US1 UI 组件:
Task T046: "创建 src/components/ui/Callout/Callout.tsx"
Task T048: "创建 src/components/ui/Tabs/Tabs.tsx"
Task T050: "创建 src/components/ui/Accordion/Accordion.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 基础设施)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (CRITICAL)
3. 完成 Phase 3: User Story 1 (核心阅读体验)
4. **STOP and VALIDATE**: 独立测试 US1
5. 可部署 MVP 版本

### P1 增量交付

1. Setup + Foundational → 基础就绪
2. US1 (阅读体验) → 独立测试 → 部署 (MVP!)
3. US2 (搜索导航) → 独立测试 → 部署
4. US3 (主题切换) → 独立测试 → 部署
5. US4 (首页展示) → 独立测试 → 部署
6. US10 (SEO 性能) → 独立测试 → 部署
7. US11 (无障碍) → 独立测试 → 部署
8. US12 (内容发布) → 独立测试 → 部署

### P2 功能迭代

9. US5 → US6 → US7 → US8

### P3 完善生态

10. US9 → US13

---

## Notes

- [P] 任务 = 不同文件，无依赖，可并行
- [Story] 标签映射任务到具体用户故事
- 每个用户故事应独立完成和测试
- 测试先行：确保测试失败后再实现
- 每个任务或逻辑组完成后提交
- 在检查点独立验证故事功能
- 避免：模糊任务、同文件冲突、跨故事依赖破坏独立性