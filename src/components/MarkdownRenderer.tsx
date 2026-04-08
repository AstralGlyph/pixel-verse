/**
 * @fileoverview Markdown/HTML 渲染组件
 * @description 渲染 TipTap 编辑器生成的 HTML 内容，支持代码高亮
 */

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={`prose prose-lg max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default MarkdownRenderer;
