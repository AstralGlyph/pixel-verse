# Feature Specification: PixelVerse 个人博客系统

**Feature Branch**: `001-pixelverse-blog`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: 打造一个**内容即体验**的个人博客系统 - 融合交互式叙事、沉浸式视觉和极致阅读体验的个人数字空间

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 阅读沉浸式文章内容 (Priority: P1)

作为博客读者，我想要阅读包含交互式元素的文章（代码演示、动态图表、动画叙事），以便获得超越传统文字阅读的丰富体验。

**Why this priority**: 核心价值主张 - "内容即体验"是本系统的根本差异化特性，没有这个功能就没有产品存在的意义。

**Independent Test**: 可以通过访问任意包含交互组件的文章页面，验证 MDX 内容渲染、代码高亮、Callout 提示框、Tab 切换组件正常工作，并确认阅读进度条和目录导航功能可用。

**Acceptance Scenarios**:

1. **Given** 访客打开一篇包含交互式代码演示的技术文章，**When** 页面加载完成，**Then** 文章正文清晰展示、代码块语法高亮正确、交互组件（如 CodePlayground）可正常操作
2. **Given** 访客正在阅读一篇长文章，**When** 向下滚动页面，**Then** 顶部阅读进度条实时显示当前阅读百分比，右侧目录自动高亮当前章节
3. **Given** 访客点击目录中的某个章节链接，**When** 执行点击操作，**Then** 页面平滑滚动到对应章节位置
4. **Given** 访客使用键盘导航（Tab/Enter/Esc），**When** 尝试操作页面元素，**Then** 所有交互元素可通过键盘完整访问

---

### User Story 2 - 快速发现和查找内容 (Priority: P1)

作为博客读者，我想要通过 Command Palette 快速搜索和导航全站内容，以便高效找到感兴趣的文章或页面。

**Why this priority**: 导航效率直接影响用户体验，Command Palette 是替代传统导航栏的核心交互模式，决定用户能否快速发现内容。

**Independent Test**: 可以通过 Cmd/Ctrl+K 唤起命令面板，验证模糊搜索文章标题、标签、分类的功能，以及快捷命令（切换主题、跳转页面）是否正常工作。

**Acceptance Scenarios**:

1. **Given** 访客按下 Cmd/Ctrl+K 组合键，**When** 命令面板弹出，**Then** 搜索输入框获得焦点，展示最近搜索历史或推荐内容
2. **Given** 访客在命令面板输入关键词，**When** 执行模糊搜索，**Then** 结果按类型分组展示（文章、页面、标签、命令），悬停时显示文章摘要预览
3. **Given** 访客使用上下箭头选择搜索结果，**When** 按 Enter 键确认，**Then** 页面跳转到目标文章或执行对应命令
4. **Given** 访客输入 `theme dark` 或 `theme light` 命令，**When** 按 Enter 执行，**Then** 页面主题立即切换

---

### User Story 3 - 主题切换与视觉体验 (Priority: P1)

作为博客读者，我想要在暗色、亮色、跟随系统三种主题模式间自由切换，以便适应不同阅读环境和个人偏好。

**Why this priority**: 视觉体验是"暗色优先、光明可选"设计原则的直接体现，主题系统是用户首次接触产品时的感知核心。

**Independent Test**: 可以通过导航栏主题切换按钮或 Command Palette 命令切换主题，验证三种主题模式正确渲染、切换动画平滑流畅。

**Acceptance Scenarios**:

1. **Given** 访客首次访问网站，**When** 页面加载，**Then** 默认展示暗色主题，所有颜色、间距、字号正确渲染
2. **Given** 访客点击主题切换按钮，**When** 选择亮色模式，**Then** 主题平滑过渡（从点击处圆形展开），所有视觉元素同步更新
3. **Given** 访客系统设置为亮色模式，**When** 选择"跟随系统"主题，**Then** 博客自动匹配系统外观偏好
4. **Given** 访客浏览器不支持 View Transitions API，**When** 切换主题，**Then** 自动降级为即时切换（无动画），主题仍正确更新

---

### User Story 4 - 个人品牌展示与首页体验 (Priority: P1)

作为博客作者，我想要首页展示我的个人品牌形象（自我介绍、精选文章、项目作品、社交链接），以便向访客传达我的专业身份和价值主张。

**Why this priority**: 首页是访客的第一印象，"去模板化"设计原则要求首页不只是文章列表，而是个人品牌展示空间。

**Independent Test**: 可以访问首页，验证 Hero Section 自我介绍、精选内容 Bento Grid 卡片、项目展示区、最新动态流正常渲染。

**Acceptance Scenarios**:

1. **Given** 访客打开首页，**When** 页面加载完成，**Then** Hero Section 展示大字标题和自我介绍，动态背景效果正常显示
2. **Given** 首页包含精选文章，**When** 以 Bento Grid 卡片展示，**Then** 卡片布局美观、响应式适配不同屏幕、hover 效果正常
3. **Given** 访客查看社交链接岛，**When** 悬停某个社交平台链接，**Then** 显示该平台的实时统计数据（如 GitHub stars）
4. **Given** 首页设有全局状态栏，**When** 状态数据更新，**Then** "当前正在做什么"实时状态正确展示

---

### User Story 5 - 博客列表浏览与筛选 (Priority: P2)

作为博客读者，我想要浏览全部文章列表并按标签/分类筛选，以便发现感兴趣的内容。

**Why this priority**: 文章发现是次要但重要的功能，支持用户探索更多内容，但核心阅读体验优先。

**Independent Test**: 可以访问博客列表页面 `/blog`，验证文章列表渲染、按标签筛选、搜索功能正常工作。

**Acceptance Scenarios**:

1. **Given** 访客打开博客列表页，**When** 页面加载，**Then** 全部文章以卡片形式展示，每张卡片包含标题、摘要、标签、发布日期、阅读时间
2. **Given** 访客点击某个标签，**When** 执行筛选操作，**Then** 仅展示包含该标签的文章，URL 更新为 `/tags/[tag]`
3. **Given** 访客在列表页使用搜索功能，**When** 输入关键词，**Then** 文章列表实时过滤，仅显示匹配结果

---

### User Story 6 - 沉浸式阅读模式 (Priority: P2)

作为博客读者，我想要一键进入沉浸式阅读模式，隐藏所有非内容元素（导航栏、侧边栏），以便专注阅读文章内容。

**Why this priority**: 阅读专注度提升是用户体验优化的重要环节，但基础阅读体验已在 P1 实现。

**Independent Test**: 可以在文章页点击阅读模式切换按钮，验证导航栏隐藏、内容区域扩展、退出阅读模式功能正常。

**Acceptance Scenarios**:

1. **Given** 访客正在阅读文章，**When** 点击阅读模式切换按钮，**Then** 导航栏、侧边栏、页脚等非内容元素隐藏，内容区域扩展至最佳阅读宽度
2. **Given** 访客处于沉浸式阅读模式，**When** 按 Esc 键或点击退出按钮，**Then** 恢复正常页面布局，所有元素重新显示
3. **Given** 访客在沉浸模式下调整字号或字体，**When** 使用排版控制面板，**Then** 内容实时响应变化，设置在当前会话保持

---

### User Story 7 - 社交互动与评论 (Priority: P2)

作为博客读者，我想要对文章进行反应（emoji reactions）、查看阅读量、参与评论讨论，以便与内容产生互动并与作者和其他读者交流。

**Why this priority**: 社交功能增强用户参与度，但核心阅读体验不依赖此功能。

**Independent Test**: 可以在文章页底部验证文章反应按钮、阅读量展示、Giscus 评论系统加载和交互。

**Acceptance Scenarios**:

1. **Given** 访客阅读完文章，**When** 点击反应按钮（如点赞、惊叹等 emoji），**Then** 反应计数增加，用户反馈动画显示，同一用户对同一文章的反应次数受到限制
2. **Given** 文章页展示阅读量，**When** 页面加载，**Then** 显示当前文章的阅读计数，同一 IP 在 24 小时内仅计数一次
3. **Given** 访客想要发表评论，**When** Giscus 评论组件加载，**Then** 显示 GitHub Discussions 集成的评论区，访客可通过 GitHub 账号登录参与讨论
4. **Given** Giscus 加载失败，**When** 超时或网络问题，**Then** 显示"评论加载失败"提示，提供跳转到 GitHub Discussions 原页面的链接

---

### User Story 8 - 文章分享与订阅 (Priority: P2)

作为博客读者，我想要分享文章到社交平台或订阅 Newsletter，以便传播有价值的内容并持续关注博客更新。

**Why this priority**: 分享和订阅功能扩大内容传播范围，但不影响核心阅读体验。

**Independent Test**: 可以在文章页验证分享栏展示、选中文字分享、Newsletter 订阅表单、RSS Feed 链接功能。

**Acceptance Scenarios**:

1. **Given** 访客选中文章中的文字段落，**When** 使用分享功能，**Then** 可通过 Web Share API 或复制链接分享选中的内容片段
2. **Given** 访客点击分享栏按钮，**When** 选择 Twitter/LinkedIn/复制链接，**Then** 正确生成包含文章标题和链接的分享内容
3. **Given** 访客在文章末尾填写邮箱订阅 Newsletter，**When** 提交订阅表单，**Then** 进入双重确认流程，收到确认邮件
4. **Given** 访客访问 RSS Feed (`/rss.xml`)，**When** Feed 加载，**Then** 显示包含全文内容的标准 RSS 2.0/Atom 格式 Feed

---

### User Story 9 - 项目展示与关于页面 (Priority: P3)

作为博客读者，我想要浏览作者的项目作品展示和个人介绍页面，以便了解作者的专业能力和背景。

**Why this priority**: 品牌展示辅助页面，补充首页展示的信息，优先级较低。

**Independent Test**: 可以访问 `/projects` 和 `/about` 页面，验证项目卡片、个人介绍时间线、技术栈可视化正常展示。

**Acceptance Scenarios**:

1. **Given** 访客打开项目页 `/projects`，**When** 页面加载，**Then** 项目卡片网格展示，每张卡片包含标题、描述、技术标签、截图/动图预览、在线预览和源码链接
2. **Given** 访客筛选项目列表，**When** 选择特定技术栈标签，**Then** 仅显示匹配该技术的项目
3. **Given** 访客打开关于页 `/about`，**When** 页面加载，**Then** 展示个人介绍时间线、技术栈可视化、工具清单、联系方式

---

### User Story 10 - SEO 与性能体验 (Priority: P1)

作为博客读者（和搜索引擎），我想要页面快速加载、SEO 优化完善，以便获得流畅的访问体验和良好的搜索可见性。

**Why this priority**: 性能和 SEO 是产品基础质量保证，直接影响用户留存和内容传播，属于 P1 级基础设施需求。

**Independent Test**: 可以通过 Lighthouse 测试验证性能指标达标，检查页面 meta 标签、OG 图片、结构化数据、Sitemap、RSS 正确生成。

**Acceptance Scenarios**:

1. **Given** 访客首次访问任意页面，**When** 页面加载，**Then** LCP < 1.5 秒，CLS < 0.05，首页 JS Bundle < 50KB（gzipped）
2. **Given** 搜索引擎爬虫访问文章页，**When** 解析页面，**Then** 正确的 title、meta description、OG 图片、JSON-LD 结构化数据存在
3. **Given** 访客分享文章到社交平台，**When** 平台解析 OG 标签，**Then** 显示自动生成的包含标题和品牌元素的分享预览图
4. **Given** 访客访问 Sitemap 或 RSS，**When** 文件加载，**Then** 自动生成的 XML 格式正确，包含全部已发布文章

---

### User Story 11 - 无障碍访问 (Priority: P1)

作为使用辅助技术的博客读者（屏幕阅读器用户、键盘用户、色弱用户），我想要完整访问所有内容和功能，以便平等地阅读和互动。

**Why this priority**: 无障碍是"可访问即美学"设计原则的核心体现，属于法律合规和道德责任要求，优先级 P1。

**Independent Test**: 可以使用键盘完整导航所有交互元素，使用屏幕阅读器验证语义化标记，验证对比度达标。

**Acceptance Scenarios**:

1. **Given** 键盘用户访问博客，**When** 使用 Tab/Enter/Esc 导航，**Then** 所有交互元素（链接、按钮、菜单）可访问，焦点样式清晰可见
2. **Given** 屏幕阅读器用户访问文章页，**When** 解析页面结构，**Then** 正确的语义化 HTML（标题层级、ARIA 标记、Alt 文本）存在，Skip Link 可用
3. **Given** 色弱用户访问博客，**When** 读取文本内容，**Then** 所有文本对比度达到 4.5:1（大字号 3:1），高对比模式支持正常
4. **Given** 用户启用减弱动效偏好，**When** 系统设置 `prefers-reduced-motion`，**Then** 所有动画自动降级或关闭

---

### User Story 12 - 作者写作与发布流程 (Priority: P1)

作为博客作者，我想要在本地使用 MDX 编写文章，通过 Git 提交自动构建部署，以便高效管理内容发布。

**Why this priority**: 内容发布流程是作者端核心功能，决定博客能否持续运营。

**Independent Test**: 可以创建包含正确 frontmatter 的 MDX 文件，提交后验证自动构建部署、草稿排除、预览功能正常。

**Acceptance Scenarios**:

1. **Given** 作者在本地创建 MDX 文件，**When** 填写 frontmatter（title、description、tags 等）并编写内容，**Then** 本地开发服务器实时预览渲染效果，支持 Hot Reload
2. **Given** 作者将文章标记为草稿（`draft: true`），**When** Git 提交并构建，**Then** 草稿文章不出现在公开博客列表和 RSS Feed 中
3. **Given** 作者提交新文章到 Git 仓库，**When** CI/CD 流程执行，**Then** 自动生成 OG 图片、更新 Sitemap、更新 RSS Feed、构建搜索索引、优化图片格式

---

### User Story 13 - 离线阅读与 PWA 体验 (Priority: P3)

作为博客读者，我想要在离线状态下继续阅读已访问的文章，以便在没有网络连接时仍能获取内容。

**Why this priority**: 离线体验是锦上添花的高级功能，不影响核心在线阅读体验。

**Independent Test**: 可以在首次访问文章后断开网络，验证 Service Worker 缓存、离线回退页面、已缓存文章列表功能。

**Acceptance Scenarios**:

1. **Given** 访客首次阅读某篇文章，**When** 页面加载完成，**Then** Service Worker 缓存该文章内容和必要资源
2. **Given** 访客断开网络连接，**When** 尝试访问已缓存的文章，**Then** 页面正常加载，展示离线阅读内容
3. **Given** 访客离线时访问未缓存的页面，**When** 加载失败，**Then** 展示友好的离线回退页面，列出已缓存的可阅读文章
4. **Given** 访客将博客添加到主屏幕，**When** 使用 Web App Manifest，**Then** 博客以原生应用体验运行，支持独立窗口启动

---

### Edge Cases

- **网络中断**: 当用户阅读过程中网络断开时，系统应继续展示已缓存内容，并在网络恢复时自动同步待发送的评论/反应
- **JS 完全禁用**: 当用户浏览器禁用 JavaScript 时，核心阅读体验（文章文本、代码高亮、图片）应完全可用，交互增强功能（如 Command Palette、主题切换动画）降级处理
- **KV 存储不可用**: 当阅读量统计的 KV 存储服务不可用时，阅读量区域应隐藏，不影响文章主体渲染
- **外部服务加载失败**: 当 Giscus/Sandpack 等外部服务加载超时时，应回退为静态内容或提供替代链接
- **超大文章内容**: 当文章包含大量代码块或图片时，应通过懒加载、可折叠代码块等技术确保页面性能不显著下降
- **特殊字符/代码注入**: 当文章内容包含特殊字符或潜在危险代码时，应正确转义和净化处理，防止 XSS 等安全漏洞
- **移动端小屏幕**: 当用户使用小屏幕设备访问时，导航栏应转化为底部 Tab Bar 或侧滑抽屉，目录改为可展开的悬浮按钮，交互组件自适应缩放
- **浏览器不支持新特性**: 当浏览器不支持 View Transitions API/WebGL/CSS Scroll-driven Animations 时，应自动降级为兼容方案，核心功能不受影响
- **深夜访问彩蛋**: 当用户在深夜时段访问博客时，可触发特殊的页面过渡动画或问候语（彩蛋功能）

## Requirements *(mandatory)*

### Functional Requirements

#### 导航与发现系统

- **FR-001**: 系统必须提供 `Cmd/Ctrl+K` 快捷键唤起的全局 Command Palette，支持模糊搜索全站文章标题、标签、分类、正文摘要
- **FR-002**: Command Palette 必须支持快捷命令执行，包括切换主题（`theme dark`/`theme light`）、跳转页面（`go about`）等
- **FR-003**: Command Palette 搜索结果必须按类型分组展示（文章、页面、标签、命令），支持键盘完整导航（上下箭头选择、Enter 确认、Esc 关闭）
- **FR-004**: 系统必须提供极简顶部导航栏，包含 Logo、核心入口（Blog/Projects/About）、主题切换按钮、Command Palette 入口
- **FR-005**: 导航栏必须支持滚动时自动收缩/隐藏，向上滚动时回弹显示
- **FR-006**: 导航栏移动端必须转化为底部 Tab Bar 或侧滑抽屉，支持视觉毛玻璃背景效果

#### 文章内容与阅读体验

- **FR-007**: 系统必须支持 MDX 格式文章渲染，允许在 Markdown 中嵌入自定义交互 React 组件
- **FR-008**: 系统必须提供内置交互组件库，包括 Callout（提示框）、Tabs（标签切换）、CodePlayground（代码编辑器+预览）、Accordion（折叠块）、ImageCompare（图片对比）等核心组件
- **FR-009**: 系统必须提供阅读进度条（顶部细线指示器），实时显示当前阅读百分比
- **FR-010**: 系统必须提供目录导航（TOC），桌面端右侧浮动 mini TOC 高亮当前章节，移动端可展开悬浮按钮，点击平滑滚动到对应章节
- **FR-011**: 系统必须提供预估阅读时间显示，基于字数和内容复杂度动态计算
- **FR-012**: 代码块必须使用编译时语法高亮（支持 100+ 语言），零客户端 JS，支持行号显示、行高亮、一键复制、文件名标签、Diff 视图、可折叠长代码

#### 视觉设计系统

- **FR-013**: 系统必须提供三套主题模式：暗色（默认）、亮色、跟随系统，支持一键切换
- **FR-014**: 主题切换必须使用 View Transitions API 实现平滑过渡动画（从点击处圆形展开），不支持时自动降级为即时切换
- **FR-015**: 所有视觉参数（颜色、间距、字号）必须通过 CSS Custom Properties 定义，主题切换仅修改变量值
- **FR-016**: 系统必须尊重 `prefers-reduced-motion` 系统设置，自动降级或关闭所有动效
- **FR-017**: 响应式布局必须使用 CSS `clamp()` 实现流体缩放，无断点跳跃，文章正文宽度限制在最佳阅读范围（65-75 字符/行）

#### 社交与互动系统

- **FR-018**: 系统必须支持文章反应（emoji reactions），非登录用户可参与，同一用户对同一文章的反应次数受限制（上限 16 次）
- **FR-019**: 系统必须展示文章阅读量统计，同一 IP 哈希在 24 小时内对同一文章仅计数一次，KV 存储不可用时隐藏该区域
- **FR-020**: 系统必须集成 Giscus 评论系统（基于 GitHub Discussions），加载失败时提供跳转到原页面链接
- **FR-021**: 系统必须提供文章分享功能，包括选中文字分享（Web Share API）、固定分享栏（Twitter/LinkedIn/复制链接/RSS）
- **FR-022**: 系统必须提供 Newsletter 邮件订阅表单，支持双重确认流程（Double Opt-in），集成 Cloudflare Turnstile 无感验证
- **FR-023**: 系统必须自动生成标准 RSS 2.0/Atom Feed（包含全文内容）和 XML Sitemap

#### 个人品牌展示

- **FR-024**: 首页必须作为个人品牌展示空间，包含 Hero Section（大字标题+自我介绍+动态背景）、精选内容 Bento Grid 卡片、项目展示区、最新动态流、社交链接岛、全局状态栏
- **FR-025**: 社交链接岛 hover 时必须显示实时统计数据（构建时通过 API 获取并写入静态 JSON）
- **FR-026**: 系统必须提供项目展示页 `/projects`，支持项目卡片网格展示和技术栈筛选
- **FR-027**: 系统必须提供关于页 `/about`，展示个人介绍时间线、技术栈可视化、工具清单、联系方式

#### SEO 与性能

- **FR-028**: 系统必须自动为每篇文章生成元信息（title、meta description）、OG 图片（包含标题和品牌元素）、JSON-LD 结构化数据（Article、Person、BreadcrumbList Schema）
- **FR-029**: 系统必须达到性能指标：LCP < 1.5s、CLS < 0.05、首页 JS Bundle < 50KB（gzipped）、Lighthouse Performance > 95
- **FR-030**: 图片必须自动优化（WebP/AVIF 格式、响应式 srcset、懒加载、LQIP 模糊预览）
- **FR-031**: 字体必须优化（font-display: swap、子集化、可变字体），核心阅读体验不依赖 JS

#### 无障碍

- **FR-032**: 系统必须达到 WCAG 2.2 AA 级合规（目标 AAA），所有文本对比度 4.5:1（大字号 3:1）
- **FR-033**: 所有交互元素必须可通过键盘完整导航（Tab/Enter/Esc），焦点样式清晰可见
- **FR-034**: 页面必须提供 Skip Link（跳转到主内容），所有图片必须包含 Alt 文本，自定义组件必须包含正确 ARIA 标记
- **FR-035**: 系统必须支持 `forced-colors` 媒体查询（高对比模式）

#### 内容管理（作者端）

- **FR-036**: 作者必须在本地使用 MDX 编写文章，通过 Git 提交自动构建部署，无需 CMS 后台
- **FR-037**: 文章 frontmatter 必须包含 title、description、publishedAt、tags、category、draft、featured、cover、toc、readingTime 等字段
- **FR-038**: 草稿文章（`draft: true`）必须在构建时排除，不出现在公开列表和 RSS Feed
- **FR-039**: 系统必须在构建时自动执行：OG 图片生成、RSS 更新、Sitemap 更新、搜索索引构建（Pagefind）、图片格式优化

#### PWA 与离线（P3）

- **FR-040**: 系统必须提供 Service Worker 缓存已访问文章，支持离线阅读，网络恢复时自动同步待发送评论/反应
- **FR-041**: 系统必须提供 Web App Manifest，支持添加到主屏幕，提供原生应用体验
- **FR-042**: 系统必须提供离线回退页面，列出已缓存的可阅读文章

#### 安全与隐私

- **FR-043**: 所有外部链接必须添加 `rel="noopener noreferrer"`
- **FR-044**: 系统必须配置 CSP (Content Security Policy) 头，不使用内联脚本（`unsafe-inline`）
- **FR-045**: 系统必须仅使用功能性 Cookie（主题偏好），不使用追踪 Cookie
- **FR-046**: 系统必须提供隐私政策页 `/privacy`，说明数据收集范围（分析数据、IP 哈希、邮件地址）
- **FR-047**: Newsletter 必须提供一键退订链接，符合 CAN-SPAM/GDPR 要求

### Key Entities

- **Article（文章）**: 博客核心内容单元，包含标题、摘要、正文（MDX 格式）、发布日期、更新日期、标签、分类、封面图、阅读时间、草稿状态、精选状态、目录开关
- **Project（项目）**: 作者的作品展示单元，包含标题、描述、技术标签、截图/动图预览、在线预览链接、源码链接、精选标记
- **Tag（标签）**: 文章分类标记，用于组织内容和筛选，支持标签云/标签图谱可视化展示标签间关联关系
- **Author Profile（作者档案）**: 个人品牌信息，包含自我介绍、技术栈、职业时间线、工具清单、社交链接、全局状态
- **Reaction（反应）**: 读者对文章的 emoji 反应记录，包含用户标识（IP 哈希）、文章 ID、反应类型、时间戳，受频率限制
- **View Count（阅读量）**: 文章访问统计，包含文章 ID、IP 哈希（24 小时去重）、访问时间、总计数
- **Newsletter Subscription（订阅）**: 邮件订阅记录，包含邮箱地址、订阅时间、确认状态（双重确认）、退订链接
- **Comment（评论）**: 通过 Giscus 集成的 GitHub Discussions 评论，外部服务托管
- **Theme Preference（主题偏好）**: 用户界面主题设置（暗色/亮色/跟随系统），存储为功能性 Cookie
- **Cached Content（缓存内容）**: Service Worker 缓存的文章和资源，用于离线阅读

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 首页加载时间（LCP）在标准网络条件下低于 1.5 秒，90% 以上用户首次访问在 2 秒内看到主要内容
- **SC-002**: Lighthouse Performance 得分达到 95 分以上，Accessibility 得分达到 100 分
- **SC-003**: 首页 JavaScript Bundle 大小（gzipped）低于 50KB，交互组件（Sandpack）独立 chunk 懒加载不计入初始 Bundle
- **SC-004**: 用户可通过键盘完整操作所有页面功能（导航、搜索、阅读、评论），无键盘陷阱
- **SC-005**: 95% 以上文章页面在禁用 JavaScript 时仍可正常阅读（文本、代码高亮、图片可用）
- **SC-006**: 用户使用 Command Palette 搜索文章，90% 以上搜索在 500ms 内返回结果并展示
- **SC-007**: 主题切换动画流畅度达到 60fps，不支持 View Transitions API 的浏览器正常降级（切换延迟低于 100ms）
- **SC-008**: 文章 OG 图片自动生成成功率 100%，社交平台分享预览正确显示标题和品牌元素
- **SC-009**: Service Worker 缓存覆盖率：用户首次访问的页面和文章在 5 分钟内可离线再次访问
- **SC-010**: 文章反应限制生效：同一用户对同一文章的反应次数不超过 16 次，24 小时内同一 IP 对同一文章阅读量仅计数一次
- **SC-011**: RSS Feed 和 Sitemap 自动更新成功率 100%，每次构建后包含全部已发布文章
- **SC-012**: 作者创建新文章（包含正确 frontmatter）提交后，CI/CD 构建成功率 95% 以上，自动生成 OG 图片、更新索引
- **SC-013**: WCAG 2.2 AA 级合规验证通过，所有文本对比度达到 4.5:1（大字号 3:1），屏幕阅读器测试通过
- **SC-014**: 移动端页面响应式适配：小屏幕（320px）和大屏幕（1920px）均正确渲染，交互组件自适应

## Assumptions

- **目标用户**: 博客读者具备稳定网络连接和现代浏览器（Chrome/Firefox/Safari/Edge 最新 2 版本、iOS Safari 16+、Android Chrome 最新版）；博客作者具备 Git 基础知识和 MDX 写作能力
- **部署环境**: 博客部署于全球 Edge CDN（如 Vercel/Cloudflare Pages），支持静态站点托管和 Edge Functions（用于阅读量统计 KV 存储）
- **内容规模**: 博客初期包含 10-50 篇文章，每月新增 2-5 篇，无大量并发访问压力（目标支持 1000 并发用户无性能降级）
- **外部服务依赖**: Giscus（GitHub Discussions）评论服务稳定可用；邮件订阅服务（Buttondown/Resend/ConvertKit）API 正常；Cloudflare Turnstile 验证服务可用；GitHub API 用于构建时获取社交统计数据
- **浏览器特性支持**: View Transitions API、WebGL、CSS Scroll-driven Animations 等新特性在不支持时自动降级，不影响核心功能
- **国际化扩展**: 目录结构和路由设计预留多语言扩展空间（如 `/en/blog/[slug]`），当前优先中文内容，未来支持英文
- **安全合规**: 部署平台支持 CSP 头配置；分析工具（Plausible/Umami）隐私友好默认不使用 Cookie；Newsletter 订阅符合 CAN-SPAM/GDPR 要求
- **内容管理流程**: 作者使用本地编辑器（VS Code 等）编写 MDX，Git 提交触发 CI/CD 自动构建部署，无需后台 CMS
- **性能优化假设**: 图片素材由作者提供原始高质量版本，构建时自动优化；字体使用开源可变字体支持子集化
- **降级容错**: KV 存储、Giscus、Sandpack 等外部服务故障时，核心阅读体验不受影响，对应功能区域隐藏或提供替代方案