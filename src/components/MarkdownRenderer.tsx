/**
 * @fileoverview 轻量级 Markdown/HTML 渲染组件
 * @description 渲染 HTML 内容，自动检测并渲染 Mermaid 图表
 */

import React from 'react';
import { MermaidRenderer } from './MermaidRenderer';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** 是否启用 Mermaid 图表渲染，默认 true */
  enableMermaid?: boolean;
}

/**
 * 检测 HTML 内容是否包含 Mermaid 代码块
 */
function hasMermaidBlocks(content: string): boolean {
  return /class=["'][^"']*\blanguage-mermaid\b[^"']*["']/i.test(content);
}

export function MarkdownRenderer({ content, className, enableMermaid = true }: MarkdownRendererProps) {
  // 如果内容包含 Mermaid 代码块且启用了渲染，使用 MermaidRenderer
  if (enableMermaid && hasMermaidBlocks(content)) {
    return <MermaidRenderer content={content} className={className} />;
  }

  // 否则使用普通的 dangerouslySetInnerHTML 渲染
  return (
    <div
      className={`prose prose-lg ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default MarkdownRenderer;
