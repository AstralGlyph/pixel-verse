/**
 * @fileoverview 前台文章 Mermaid 图表渲染组件
 * @description 使用 IntersectionObserver 懒加载，骨架屏过渡
 * @dependencies mermaid, DOMPurify
 */

import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

declare global {
  interface Window {
    __mermaidInitializedTheme?: string;
  }
}

// ─── SVG 安全过滤 ──────────────────────────────────────────

const SVG_ALLOWED_TAGS = [
  'svg', 'g', 'path', 'rect', 'circle', 'text', 'line',
  'polygon', 'polyline', 'marker', 'defs', 'use', 'tspan',
  'style', 'clipPath', 'pattern', 'linearGradient', 'radialGradient',
  'stop', 'ellipse', 'foreignObject', 'html',
];

const HTML_ALLOWED_TAGS = [
  'div', 'span', 'br', 'em', 'strong', 'p', 'a', 'ul', 'ol', 'li',
  'label', 'b', 'i', 'u', 's', 'sub', 'sup', 'code', 'pre',
];

const ALL_ALLOWED_TAGS = [...SVG_ALLOWED_TAGS, ...HTML_ALLOWED_TAGS];

const SVG_ALLOWED_ATTRS = [
  'class', 'style', 'id', 'transform', 'fill', 'stroke',
  'stroke-width', 'stroke-dasharray', 'opacity', 'x', 'y',
  'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 'd',
  'points', 'viewBox', 'xmlns', 'version', 'text-anchor',
  'dominant-baseline', 'font-family', 'font-size', 'textLength',
  'lengthAdjust', 'marker-start', 'marker-end', 'marker-mid',
  'clip-path', 'href', 'xlink:href', 'gradientUnits',
  'offset', 'stop-color', 'stop-opacity',
  'dir', 'lang', 'target', 'rel', 'tabindex',
  // line 元素属性（sequenceDiagram 角色连线）
  'x1', 'y1', 'x2', 'y2',
  // 额外 SVG 属性
  'role', 'aria-roledescription', 'type', 'fill-rule', 'clip-rule',
];

const RENDER_TIMEOUT = 5000;

function sanitizeSVG(svgString: string): string {
  return DOMPurify.sanitize(svgString, {
    // 不使用 USE_PROFILES：svg+html 混合模式会剥离 foreignObject 内的 HTML 元素
    ALLOWED_TAGS: ALL_ALLOWED_TAGS,
    ALLOWED_ATTR: SVG_ALLOWED_ATTRS,
    FORBID_TAGS: ['script', 'iframe'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
    ALLOW_DATA_ATTR: false,
  });
}

// ─── 骨架屏 HTML 模板 ─────────────────────────────────────

const SKELETON_HTML = `<div class="my-4 rounded-lg border border-glass-border bg-glass-bg-subtle p-6">
  <div class="mx-auto flex flex-col items-center gap-3">
    <div class="h-8 w-3/4 animate-pulse rounded bg-glass-border"></div>
    <div class="h-6 w-1/2 animate-pulse rounded bg-glass-border"></div>
    <div class="h-6 w-2/3 animate-pulse rounded bg-glass-border"></div>
  </div>
</div>`;

// ─── 主组件：扫描并渲染 Mermaid 代码块 ──────────────────────

interface MermaidRendererProps {
  /** 包含 Mermaid 代码块的 HTML 内容 */
  content: string;
  /** 额外样式类 */
  className?: string;
}

function escapeHtml(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 前台文章 Mermaid 渲染器
 *
 * 工作原理：
 * 1. 渲染 HTML 内容
 * 2. 查找所有 .language-mermaid 的 <code> 元素
 * 3. 用骨架屏替换它们
 * 4. IntersectionObserver 检测视口进入
 * 5. 懒加载 mermaid.js 并渲染
 */
export function MermaidRenderer({ content, className }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || processedRef.current) return;
    processedRef.current = true;

    const observers: IntersectionObserver[] = [];

    // 找到所有 Mermaid 代码块
    const codeBlocks = container.querySelectorAll('pre code.language-mermaid');
    if (codeBlocks.length === 0) return;

    const renderBlock = async (preEl: HTMLElement, code: string, index: number) => {
      // 替换为骨架屏
      const skeleton = document.createElement('div');
      skeleton.setAttribute('data-mermaid-target', 'true');
      skeleton.className = 'mermaid-loading-wrapper';
      skeleton.innerHTML = SKELETON_HTML;
      preEl.replaceWith(skeleton);

      // IntersectionObserver 懒加载
      const observer = new IntersectionObserver(
        async (entries) => {
          if (!entries[0].isIntersecting) return;
          observer.disconnect();

          try {
            // 动态加载 mermaid
            const { default: mermaid } = await import('mermaid');

            // 全局初始化标志，防止重复初始化
            const isDark = document.documentElement.classList.contains('dark');
            const currentTheme = isDark ? 'dark' : 'default';
            if (window.__mermaidInitializedTheme !== currentTheme) {
              mermaid.initialize({
                startOnLoad: false,
                securityLevel: 'antiscript', // 允许文本标签，阻止脚本执行（配合 DOMPurify 使用）
                theme: currentTheme,
              });
              window.__mermaidInitializedTheme = currentTheme;
            }

            const renderId = `mermaid-frontend-${index}-${Date.now()}`;

            // 超时控制
            const renderPromise = mermaid.render(renderId, code);
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('渲染超时（>5s），请简化图表')), RENDER_TIMEOUT);
            });

            const { svg } = await Promise.race([renderPromise, timeoutPromise]);
            const cleanSvg = sanitizeSVG(svg);

            skeleton.innerHTML = `<div class="my-4 overflow-auto rounded-lg border border-glass-border p-4"><style>.mermaid-rendered-wrapper svg{max-width:100%!important;width:100%!important;height:auto!important}</style>${cleanSvg}</div>`;
            skeleton.removeAttribute('data-mermaid-target');
            skeleton.className = 'mermaid-rendered-wrapper';
          } catch (err) {
            const message = err instanceof Error ? err.message : '渲染失败';
            const escapedCode = escapeHtml(code);
            skeleton.innerHTML = `
              <div class="my-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p class="text-sm font-medium text-yellow-700">图表渲染失败</p>
                <details class="mt-2">
                  <summary class="cursor-pointer text-xs text-yellow-600">查看原始代码</summary>
                  <pre class="mt-2 overflow-x-auto rounded bg-yellow-100 p-3 text-xs text-yellow-800"><code>${escapedCode}</code></pre>
                </details>
                <p class="mt-2 text-xs text-yellow-600">${message}</p>
              </div>`;
          }
        },
        { rootMargin: '200px' }
      );

      observers.push(observer);
      observer.observe(skeleton);
    };

    codeBlocks.forEach((codeEl, index) => {
      const code = codeEl.textContent || '';
      if (!code.trim()) return;
      const preEl = codeEl.closest('pre');
      if (!preEl) return;
      renderBlock(preEl as HTMLElement, code, index);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={`prose prose-lg ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default MermaidRenderer;
