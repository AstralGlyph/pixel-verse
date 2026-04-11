/**
 * @fileoverview 轻量级 Markdown/HTML 渲染组件
 * @description 仅渲染 HTML 内容，不包含 Shiki 依赖。适用于 SSR 已高亮的场景
 */

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={`prose prose-lg ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default MarkdownRenderer;
