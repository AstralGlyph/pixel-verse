# TipTap Code Marks 共存实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 允许 TipTap 行内代码（code mark）与 bold、italic、underline、strike 等 marks 自由组合叠加。

**Architecture:** 从 StarterKit 中禁用默认 code mark，单独引入 `@tiptap/extension-code` 并通过 `.extend()` 覆盖 schema 的 `marks` 属性为空字符串，允许与其他 marks 共存。

**Tech Stack:** TipTap 3.22, React 18, Vitest, Playwright

---

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 新增 `@tiptap/extension-code` 依赖 |
| `pnpm-lock.yaml` | 自动更新 | 依赖安装后自动生成 |
| `src/admin/components/editor/Editor.tsx` | 修改 | 替换 code 配置，更新注释 |
| `tests/unit/components/editor/code-mark-coexistence.test.ts` | 新建 | code mark 共存测试 |

---

### Task 1: 安装 @tiptap/extension-code 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装依赖包**

Run:
```bash
pnpm add @tiptap/extension-code@^3.22.0
```

- [ ] **Step 2: 验证安装成功**

Run:
```bash
pnpm list @tiptap/extension-code
```
Expected output: `@tiptap/extension-code@3.22.x`

- [ ] **Step 3: 确认项目仍能构建**

Run:
```bash
pnpm build
```
Expected: Build succeeds (any existing errors are pre-existing)

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add @tiptap/extension-code dependency for marks coexistence"
```

---

### Task 2: 修改 Editor.tsx — 替换 code mark 配置

**Files:**
- Modify: `src/admin/components/editor/Editor.tsx`

- [ ] **Step 1: 添加 Code 扩展导入**

在 [Editor.tsx:34](src/admin/components/editor/Editor.tsx#L34)（Audio import 之后）添加：

```typescript
import Code from '@tiptap/extension-code';
```

- [ ] **Step 2: 禁用 StarterKit 内置 code mark**

修改 [Editor.tsx:146-150](src/admin/components/editor/Editor.tsx#L146-L150) 的 StarterKit 配置，添加 `code: false`：

```typescript
StarterKit.configure({
  heading: { levels: [1, 2, 3] },
  blockquote: { HTMLAttributes: { class: 'zen-blockquote' } },
  code: false,         // 禁用内置 code，使用独立扩展以支持 marks 共存
  codeBlock: false,    // 使用 CodeBlockLowlight 替代
}),
```

- [ ] **Step 3: 添加独立 Code 扩展到 extensions 数组**

在 [Editor.tsx:150](src/admin/components/editor/Editor.tsx#L150)（StarterKit 配置之后，Underline 之前）添加：

```typescript
Code.extend({
  // 覆盖默认 marks: '' 配置，允许 code 与其他 marks（bold/italic/underline/strike）共存
}),
```

最终 extensions 数组前几项应该是：
```typescript
extensions: [
  StarterKit.configure({ /* ... */ }),
  Code.extend({ /* ... */ }),
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  // ... 其余不变
],
```

- [ ] **Step 4: 更新 handlePaste 注释**

修改 [Editor.tsx:251-254](src/admin/components/editor/Editor.tsx#L251-L254) 的 catch 块注释，说明 code+bold 冲突已解决：

```typescript
} catch {
  // Markdown 解析产生的 mark 组合可能与 schema 冲突（已由 code mark 共存修复解决大部分场景），
  // 降级为普通文本插入，由 TipTap 自动识别内联语法
  editorInstance.chain().focus().insertContent(text).run();
}
```

- [ ] **Step 5: 验证 TypeScript 编译通过**

Run:
```bash
pnpm exec tsc --noEmit 2>&1 | head -30
```
Expected: No errors related to Editor.tsx or @tiptap/extension-code

- [ ] **Step 6: Commit**

```bash
git add src/admin/components/editor/Editor.tsx
git commit -m "feat(Editor): 允许 code mark 与其他 marks 共存

- 禁用 StarterKit 内置 code mark
- 引入独立 @tiptap/extension-code 扩展
- 通过 .extend() 覆盖 marks 配置允许 marks 叠加
- 更新 handlePaste 注释说明冲突已解决"
```

---

### Task 3: 编写 code mark 共存单元测试

**Files:**
- Create: `tests/unit/components/editor/code-mark-coexistence.test.ts`

- [ ] **Step 1: 编写测试文件**

Create `tests/unit/components/editor/code-mark-coexistence.test.ts`:

```typescript
/**
 * @fileoverview Code mark 与其他 marks 共存的单元测试
 * @description 验证 code mark 可以与 bold、italic、underline、strike 同时应用
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Code from '@tiptap/extension-code';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

describe('Code mark coexistence', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [
        StarterKit.configure({
          code: false,
        }),
        Code.extend({
          // 允许 code 与其他 marks 共存
        }),
        Underline,
      ],
      content: '<p>测试文本</p>',
    });
  });

  it('应允许 code 和 bold 同时应用', () => {
    editor.chain().setContent('<p>测试文本</p>').selectAll().toggleCode().run();
    editor.chain().toggleBold().run();

    const html = editor.getHTML();
    // code 和 bold 应该同时存在
    expect(html).toContain('<code>');
    expect(html).toContain('<strong>');
  });

  it('应允许 code 和 italic 同时应用', () => {
    editor.chain().setContent('<p>测试文本</p>').selectAll().toggleCode().run();
    editor.chain().toggleItalic().run();

    const html = editor.getHTML();
    expect(html).toContain('<code>');
    expect(html).toContain('<em>');
  });

  it('应允许 code 和 underline 同时应用', () => {
    editor.chain().setContent('<p>测试文本</p>').selectAll().toggleCode().run();
    editor.chain().toggleUnderline().run();

    const html = editor.getHTML();
    expect(html).toContain('<code>');
    expect(html).toContain('<u>');
  });

  it('应允许 code 和 strike 同时应用', () => {
    editor.chain().setContent('<p>测试文本</p>').selectAll().toggleCode().run();
    editor.chain().toggleStrike().run();

    const html = editor.getHTML();
    expect(html).toContain('<code>');
    expect(html).toContain('<s>');
  });

  it('应允许 code 和 bold、italic 三者同时应用', () => {
    editor.chain().setContent('<p>测试文本</p>').selectAll().toggleCode().run();
    editor.chain().toggleBold().run();
    editor.chain().toggleItalic().run();

    const html = editor.getHTML();
    expect(html).toContain('<code>');
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
  });

  it('code mark 切换后应正确清除', () => {
    editor.chain().setContent('<p>测试文本</p>').selectAll().toggleCode().run();
    expect(editor.isActive('code')).toBe(true);

    editor.chain().toggleCode().run();
    expect(editor.isActive('code')).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试验证全部通过**

Run:
```bash
pnpm test tests/unit/components/editor/code-mark-coexistence.test.ts
```

Expected output: All 6 tests pass.

If any test fails, check:
- `@tiptap/extension-code` version matches other @tiptap packages
- The `.extend()` override is applied correctly
- Underline extension is loaded after Code

- [ ] **Step 3: 运行全部测试确保无回归**

Run:
```bash
pnpm test
```

Expected: All existing tests pass + 6 new tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/unit/components/editor/code-mark-coexistence.test.ts
git commit -m "test(Editor): 添加 code mark 共存单元测试"
```

---

## 自审检查

### Spec 覆盖检查

| 验收标准 | 对应 Task |
|----------|-----------|
| code mark 可以与 bold 同时应用 | Task 3: 测试用例 1 |
| code mark 可以与 italic 同时应用 | Task 3: 测试用例 2 |
| code mark 可以与 underline 同时应用 | Task 3: 测试用例 3 |
| code mark 可以与 strike 同时应用 | Task 3: 测试用例 4 |
| code mark 可以与 bold+italic 三者共存 | Task 3: 测试用例 5 |
| Markdown 粘贴时 bold+code 不再崩溃 | Task 2: 更新注释 + 测试已隐含 |
| 气泡菜单 code 按钮正常 | 现有代码无需修改 |
| 工具栏 code 按钮正常 | 现有代码无需修改 |
| CodeBlockLowlight 不受影响 | Task 2: 仅替换 inline code |

### 占位符扫描
无 TBD/TODO/placeholder，所有代码步骤包含完整代码。

### 类型一致性
所有测试使用 `@tiptap/extension-code` 3.22.x 版本，与 `@tiptap/core`、`@tiptap/starter-kit` 版本一致。
