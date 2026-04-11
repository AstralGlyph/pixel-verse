# 设计文档：粘贴 Markdown 自动转换

**日期**: 2026-04-07
**状态**: 已批准
**相关文件**: [Editor.tsx](src/admin/components/editor/Editor.tsx)

## 概述

在 TipTap 富文本编辑器中，当用户粘贴包含 Markdown 语法的纯文本内容时，自动将其转换为对应的富文本格式（标题、粗体、列表等），提升内容编辑效率。

## 方案选择

使用 TipTap 官方 `@tiptap/extension-markdown` 扩展 + 自定义 `handlePaste` 拦截逻辑。

## 技术实现

### 1. 依赖

```
pnpm add @tiptap/extension-markdown
```

### 2. 新增文件

**`src/lib/utils/isMarkdown.ts`** — Markdown 语法检测工具函数

检测规则：
- 标题 (`#` ~ `######`)
- 无序列表 (`-`, `*`, `+`)
- 有序列表 (`1.`, `2.`)
- 任务列表 (`- [ ]`, `- [x]`)
- 引用 (`>`)
- 代码块 (```)
- 分割线 (`---`, `***`)
- 粗体 (`**text**`)
- 斜体 (`*text*`)
- 行内代码 (`` `code` ``)
- 链接 (`[text](url)`)
- 图片 (`![alt](url)`)
- 表格 (`| col |`)

### 3. 修改文件

**`src/admin/components/editor/Editor.tsx`**

- 添加 `Markdown` 扩展
- 在 `editorProps.handlePaste` 中实现粘贴拦截逻辑
- 逻辑流程：
  1. 检查剪贴板是否有 HTML → 有则默认处理（保留富文本粘贴）
  2. 检查纯文本是否为 Markdown → 是则转换后插入
  3. 否则默认处理（普通纯文本粘贴）

### 4. 数据流

```
用户粘贴 (Ctrl+V)
    ↓
handlePaste 拦截
    ↓
检查是否有 HTML？
    ├── 有 → 默认处理（富文本粘贴）
    └── 无 → 检查纯文本
              ↓
          isMarkdown() 检测
              ├── 是 → Markdown 扩展解析 → 插入 TipTap 节点
              └── 否 → 默认处理（纯文本粘贴）
```

### 5. 支持的 Markdown 语法映射

| Markdown 语法 | TipTap 节点 |
|---------------|-------------|
| `# 标题` | Heading (H1-H6) |
| `**粗体**` / `*斜体*` | Bold / Italic mark |
| `- 列表` / `1. 列表` | BulletList / OrderedList |
| `- [ ] 任务` | TaskList + TaskItem |
| `> 引用` | Blockquote |
| `` `代码` `` | Code mark |
| ` ``` 代码块 ``` ` | CodeBlock |
| `[链接](url)` | Link mark |
| `![图片](url)` | Image node |
| `---` | HorizontalRule |
| `\| 表格 \|` | Table node |

### 6. 错误处理

- Markdown 解析失败时降级为普通纯文本粘贴
- 不丢失用户内容
- 不阻塞编辑器正常操作

### 7. 测试要点

- `isMarkdown()` 单元测试：各种 Markdown 语法检测准确性
- 集成测试：粘贴不同 Markdown 内容，验证渲染正确性
- 边界测试：空内容、纯文本、HTML 与 Markdown 混合
