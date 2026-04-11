# 设计文档：TipTap Code Mark 与其他 Marks 共存

**日期**: 2026-04-08
**状态**: 已批准
**分支**: 004-admin-cms

---

## 问题描述

TipTap 的 `StarterKit` 内置的 `code` mark 使用 `marks: ''` 配置，不允许与其他 marks（bold、italic、underline、strike）共存。当 Markdown 粘贴时出现 bold+code 组合会导致编辑器崩溃，需要通过 try-catch 降级处理。

---

## 方案选择

从 `StarterKit` 中禁用默认 code mark，单独引入 `@tiptap/extension-code` 并通过 `.extend()` 覆盖 schema 中的 `marks` 属性，允许与其他 marks 自由组合。

**选择理由**：改动最小，风险最低，符合 TipTap 官方推荐的定制方式。

---

## 设计细节

### 1. 依赖变更

| 包名 | 版本 | 说明 |
|------|------|------|
| `@tiptap/extension-code` | 与现有 @tiptap 包版本一致 | 新增独立 code 扩展 |

### 2. Editor.tsx 配置变更

**StarterKit 修改**：
```typescript
StarterKit.configure({
  code: false,  // 禁用内置 code mark，使用独立扩展
  heading: { levels: [1, 2, 3] },
  blockquote: { HTMLAttributes: { class: 'zen-blockquote' } },
  codeBlock: false,
}),
```

**新增 Code 扩展**：
```typescript
import Code from '@tiptap/extension-code';

// 在 extensions 数组中添加：
Code.extend({
  // 覆盖默认 marks: '' 配置，允许 code 与其他 marks 共存
}),
```

### 3. handlePaste 优化

文件：`src/admin/components/editor/Editor.tsx`

- 保留现有 try-catch 降级逻辑（处理其他未知冲突）
- 更新注释说明 code+bold 冲突已解决
- 降级路径不再需要处理最常见的 bold+code 场景

### 4. CSS 样式

当前 code 样式已支持叠加效果：
- `font-weight: 700`（bold）会自然叠加到等宽字体上
- `font-style: italic` 会自然叠加
- `text-decoration`（underline/strike）正常显示
- 无需额外 CSS 修改

### 5. 样式叠加行为

| 组合 | 最终渲染效果 |
|------|-------------|
| code + bold | 等宽 + 粗体 + 背景色 + 代码颜色 |
| code + italic | 等宽 + 斜体 + 背景色 + 代码颜色 |
| code + underline | 等宽 + 下划线 + 背景色 + 代码颜色 |
| code + strike | 等宽 + 删除线 + 背景色 + 代码颜色 |
| code + bold + italic | 等宽 + 粗体 + 斜体 + 背景色 + 代码颜色 |

---

## 影响范围

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `package.json` | 修改 | 新增 `@tiptap/extension-code` 依赖 |
| `pnpm-lock.yaml` | 修改 | 锁定新版本 |
| `src/admin/components/editor/Editor.tsx` | 修改 | 替换 code 配置，优化注释 |

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| `.extend()` API 行为变化 | code mark 可能不生效 | 使用与现有 @tiptap 包相同版本 |
| 其他 marks 的 inclusive 配置冲突 | 某些组合可能仍不工作 | 测试所有 mark 组合场景 |
| Markdown 导出格式变化 | 导出的 Markdown 可能包含嵌套语法 | TipTap markdown 序列化会自动处理 |

---

## 验收标准

- [ ] code mark 可以与 bold 同时应用
- [ ] code mark 可以与 italic 同时应用
- [ ] code mark 可以与 underline 同时应用
- [ ] code mark 可以与 strike 同时应用
- [ ] Markdown 粘贴时 bold+code 组合不再导致崩溃
- [ ] 气泡菜单中 code 按钮正常工作
- [ ] 工具栏中 code 按钮正常工作
- [ ] 现有代码块（CodeBlockLowlight）不受影响
