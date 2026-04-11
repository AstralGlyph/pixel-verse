/**
 * @fileoverview 带 Shiki 高亮的 Markdown/HTML 渲染组件
 * @description 客户端渲染 TipTap 编辑器生成的 HTML 内容，并使用 Shiki 进行代码语法高亮
 * @description 适用于管理后台等需要客户端高亮的场景
 */

import React, { useEffect, useState } from 'react';
import { highlightCode } from '../utils/highlight';

interface HighlightedMarkdownRendererProps {
  content: string;
  className?: string;
}

export function HighlightedMarkdownRenderer({
  content,
  className,
}: HighlightedMarkdownRendererProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    highlightCode(content)
      .then((html: string) => {
        if (!cancelled) setHighlightedHtml(html);
      })
      .catch(() => {
        // 高亮失败时使用原始内容
        if (!cancelled) setHighlightedHtml(null);
      });

    return () => {
      cancelled = true;
    };
  }, [content]);

  const html = highlightedHtml || content;

  return (
    <div
      className={`prose prose-lg ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default HighlightedMarkdownRenderer;
