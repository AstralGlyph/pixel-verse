/**
 * @fileoverview Mermaid 图表渲染工具模块
 * @description 提供单例管理、防抖渲染、SVG 安全过滤和错误处理
 * @dependencies mermaid, DOMPurify
 */

import mermaid, { type MermaidConfig } from 'mermaid';
import DOMPurify from 'dompurify';

// ─── 单例管理 ──────────────────────────────────────────────

let currentMermaidTheme: 'default' | 'dark' | null = null;

/**
 * 初始化 Mermaid 单例
 * 主题变化时重新初始化
 */
function initializeMermaid(theme: 'default' | 'dark' = 'default') {
  if (currentMermaidTheme === theme) return;

  const config: MermaidConfig = {
    startOnLoad: false,
    securityLevel: 'antiscript', // 允许文本标签，阻止脚本执行（配合 DOMPurify 使用）
    theme,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  mermaid.initialize(config);
  currentMermaidTheme = theme;
}

/**
 * 确保 Mermaid 已初始化并返回实例
 * 主题切换时重新初始化
 */
export function getMermaidInstance(theme: 'default' | 'dark' = 'default') {
  initializeMermaid(theme);
  return mermaid;
}

// ─── SVG 安全过滤 ──────────────────────────────────────────

/**
 * 允许的 SVG 元素白名单
 */
const SVG_ALLOWED_TAGS = [
  'svg', 'g', 'path', 'rect', 'circle', 'text', 'line',
  'polygon', 'polyline', 'marker', 'defs', 'use', 'tspan',
  'style', 'clipPath', 'pattern', 'linearGradient', 'radialGradient',
  'stop', 'ellipse', 'foreignObject', 'html',
];

/**
 * 允许的 HTML 元素白名单（用于 foreignObject 内的文本标签）
 * Mermaid 在 foreignObject 中使用 HTML 元素渲染文本
 */
const HTML_ALLOWED_TAGS = [
  'div', 'span', 'br', 'em', 'strong', 'p', 'a', 'ul', 'ol', 'li',
  'label', 'b', 'i', 'u', 's', 'sub', 'sup', 'code', 'pre',
];

/**
 * 允许的 SVG + HTML 元素白名单（合并后使用）
 */
const ALL_ALLOWED_TAGS = [...SVG_ALLOWED_TAGS, ...HTML_ALLOWED_TAGS];

/**
 * 允许的 SVG 属性白名单
 */
const SVG_ALLOWED_ATTRS = [
  'class', 'style', 'id', 'transform', 'fill', 'stroke',
  'stroke-width', 'stroke-dasharray', 'opacity', 'x', 'y',
  'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 'd',
  'points', 'viewBox', 'xmlns', 'version', 'text-anchor',
  'dominant-baseline', 'font-family', 'font-size', 'textLength',
  'lengthAdjust', 'marker-start', 'marker-end', 'marker-mid',
  'clip-path', 'href', 'xlink:href', 'gradientUnits',
  'offset', 'stop-color', 'stop-opacity',
  // HTML 属性（用于 foreignObject 内的元素）
  'dir', 'lang', 'target', 'rel', 'tabindex',
  // line 元素属性（sequenceDiagram 角色连线）
  'x1', 'y1', 'x2', 'y2',
  // polygon 元素属性
  'role', 'aria-roledescription',
  // style element
  'type',
  // rect element
  'fill-rule', 'clip-rule',
];

/**
 * 过滤 Mermaid 渲染后的 SVG 字符串，防止 XSS 攻击
 */
export function sanitizeMermaidSVG(svgString: string): string {
  return DOMPurify.sanitize(svgString, {
    // 不使用 USE_PROFILES：svg+html 混合模式会剥离 foreignObject 内的 HTML 元素
    ALLOWED_TAGS: ALL_ALLOWED_TAGS,
    ALLOWED_ATTR: SVG_ALLOWED_ATTRS,
    FORBID_TAGS: ['script', 'iframe'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['data-mermaid-id'],
  });
}

// ─── 渲染函数 ──────────────────────────────────────────────

/**
 * 渲染超时（毫秒）
 */
const RENDER_TIMEOUT = 5000;

/**
 * 渲染 Mermaid 图表，返回经过安全过滤的 SVG 字符串
 * @param code Mermaid 语法代码
 * @param id 唯一标识符，用于 Mermaid 内部追踪
 * @param theme 主题
 * @returns 过滤后的 SVG HTML 字符串
 * @throws 解析错误或超时错误
 */
export async function renderMermaidDiagram(
  code: string,
  id: string,
  theme: 'default' | 'dark' = 'default',
): Promise<string> {
  const m = getMermaidInstance(theme);

  const renderPromise = m.render(id, code);

  // 超时控制
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('渲染超时（>5s），请简化图表'));
    }, RENDER_TIMEOUT);
  });

  const { svg } = await Promise.race([renderPromise, timeoutPromise]);
  return sanitizeMermaidSVG(svg);
}

// ─── 防抖渲染 ──────────────────────────────────────────────

/**
 * 创建防抖渲染函数
 * @param onRender 渲染成功回调
 * @param onError 渲染错误回调
 * @param delay 防抖延迟（毫秒）
 */
export function createDebouncedMermaidRenderer(
  onRender: (svg: string) => void,
  onError: (error: string) => void,
  delay = 300,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let renderId = 0;

  return function debouncedRender(
    code: string,
    theme: 'default' | 'dark' = 'default',
  ) {
    if (timer) {
      clearTimeout(timer);
    }

    if (!code.trim()) {
      onError('');
      return;
    }

    timer = setTimeout(async () => {
      const id = `mermaid-${Date.now()}-${renderId++}`;
      try {
        const svg = await renderMermaidDiagram(code, id, theme);
        onRender(svg);
      } catch (err) {
        const message = err instanceof Error ? err.message : '未知渲染错误';
        onError(message);
      }
    }, delay);
  };
}

// ─── TipTap Node 定义 ─────────────────────────────────────

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MermaidBlockView } from '../components/MermaidBlockView';

/**
 * MermaidBlock 的 React Node View 组件
 * 包装 CodeBlock 并在下方显示 MermaidPreview
 */
function MermaidBlockComponent({
  node,
  getPos,
  updateAttributes,
  editor,
}: {
  node: any;
  getPos: () => number | undefined;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  editor: any;
}) {
  return (
    <MermaidBlockView
      node={node}
      getPos={getPos}
      updateAttributes={updateAttributes}
      editor={editor}
    />
  );
}

/**
 * MermaidBlock - 自定义 TipTap Node
 * 包装 CodeBlock 并附加 Mermaid 实时预览
 */
export const MermaidBlock = Node.create({
  name: 'mermaidBlock',

  group: 'block',

  content: 'text*',

  addAttributes() {
    return {
      previewOpen: {
        default: true,
      },
      theme: {
        default: 'default',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid-block"]',
        getAttrs: (dom) => {
          const codeEl = (dom as HTMLElement).querySelector('code.language-mermaid');
          return codeEl ? {} : false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid-block' }),
      ['pre', {}, ['code', { class: 'language-mermaid' }, 0]],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidBlockComponent);
  },
});
