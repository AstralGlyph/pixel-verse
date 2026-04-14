/**
 * @fileoverview 带 slug 的 Heading 扩展
 * @description 基于标题文本自动生成可读的 slug 属性，用于大纲锚点和前端渲染
 * @dependencies @tiptap/extension-heading, generateHeadingSlug
 */

import { Heading } from '@tiptap/extension-heading';
import { generateHeadingSlug } from '../../../../lib/utils/slug';

export const HeadingWithId = Heading.extend({
  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: true,
      },
      slug: {
        default: null,
        rendered: true,
      },
    };
  },

  /**
   * HTML 渲染时将 slug 输出为 id 属性
   * 注意：UniqueID 扩展也会输出 id（UUID），这里 renderHTML 的输出
   * 会被 TipTap 合并。由于 slug 是可读的，我们优先使用它。
   */
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level ?? 1;
    const slug = node.attrs.slug || '';
    return [
      `h${level}`,
      {
        ...HTMLAttributes,
        ...(slug ? { id: slug } : {}),
      },
      0,
    ];
  },
});

/**
 * 为标题节点生成并更新 slug（编辑器更新时调用）
 * @param tr - 当前的 ProseMirror Transaction
 * @returns 更新后的 Transaction，或 null（无变化时）
 */
export function updateHeadingSlugs(tr: any): any | null {
  const { doc } = tr;
  const existingSlugs: string[] = [];

  // 第一轮：收集所有现有 slug
  doc.descendants((node: any) => {
    if (node.type.name === 'heading' && node.attrs.slug) {
      existingSlugs.push(node.attrs.slug);
    }
  });

  // 第二轮：生成新 slug 并记录更新
  const updates: { pos: number; attrs: Record<string, unknown> }[] = [];

  doc.descendants((node: any, pos: number) => {
    if (node.type.name !== 'heading') return;
    const text = node.textContent || '';
    const currentSlug = node.attrs.slug;

    // 从已有 slug 列表中移除当前节点的 slug，避免自我冲突
    if (currentSlug) {
      const idx = existingSlugs.indexOf(currentSlug);
      if (idx !== -1) existingSlugs.splice(idx, 1);
    }

    // 为每个标题生成 slug（确保去重）
    const newSlug = generateHeadingSlug(text, existingSlugs);
    existingSlugs.push(newSlug);

    if (currentSlug !== newSlug) {
      updates.push({ pos, attrs: { ...node.attrs, slug: newSlug } });
    }
  });

  // 如果没有需要更新的，返回 null
  if (updates.length === 0) return null;

  // 从后往前应用更新，避免位置偏移
  for (let i = updates.length - 1; i >= 0; i--) {
    const { pos, attrs } = updates[i];
    const node = doc.nodeAt(pos);
    if (node) {
      tr.setNodeMarkup(pos, undefined, attrs);
    }
  }

  return tr;
}
