/**
 * @fileoverview Mermaid 编辑器内实时预览组件
 * @description 显示骨架屏、loading、渲染结果或错误信息
 * @dependencies ../extensions/mermaid
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createDebouncedMermaidRenderer } from '../extensions/mermaid';

interface MermaidPreviewProps {
  /** Mermaid 源代码 */
  code: string;
  /** 主题 */
  theme?: 'default' | 'dark';
}

type PreviewState =
  | { type: 'idle' }
  | { type: 'empty' }
  | { type: 'loading' }
  | { type: 'success'; svg: string }
  | { type: 'error'; message: string };

export function MermaidPreview({ code, theme = 'default' }: MermaidPreviewProps) {
  const [state, setState] = useState<PreviewState>({ type: 'idle' });
  const debouncedRenderRef = useRef<ReturnType<typeof createDebouncedMermaidRenderer> | null>(null);

  // 创建防抖渲染函数（只创建一次）
  useEffect(() => {
    const debouncedRender = createDebouncedMermaidRenderer(
      (svg) => setState({ type: 'success', svg }),
      (error) => {
        if (error === '') {
          setState({ type: 'empty' });
        } else {
          setState({ type: 'error', message: error });
        }
      },
      300,
    );
    debouncedRenderRef.current = debouncedRender;

    return () => {
      debouncedRenderRef.current = null;
    };
  }, []);

  // 监听代码变化，触发防抖渲染
  useEffect(() => {
    if (!code.trim()) {
      setState({ type: 'empty' });
      return;
    }

    setState({ type: 'loading' });
    debouncedRenderRef.current?.(code, theme);
  }, [code, theme]);

  // 全屏查看
  const handleExpand = useCallback(() => {
    if (state.type !== 'success') return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Mermaid 图表预览</title>
        <style>
          body { display: flex; justify-content: center; align-items: center;
                 min-height: 100vh; margin: 0; background: ${theme === 'dark' ? '#1e1e1e' : '#fff'}; }
          svg { max-width: 100%; height: auto; }
        </style>
        </head>
        <body>${state.svg}</body>
        </html>
      `);
      win.document.close();
    }
  }, [state.type, state.type === 'success' ? (state as Extract<PreviewState, { type: 'success' }>).svg : null, theme]);

  // 下载 SVG
  const handleDownload = useCallback(() => {
    if (state.type !== 'success') return;
    const svg = (state as Extract<PreviewState, { type: 'success' }>).svg;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mermaid-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [state.type, state.type === 'success' ? (state as Extract<PreviewState, { type: 'success' }>).svg : null]);

  // ─── 渲染各状态 UI ─────────────────────────────────────

  if (state.type === 'idle') {
    return (
      <div className="mermaid-preview-container border-t border-glass-border bg-glass-bg-subtle px-4 py-6">
        <div className="mermaid-skeleton flex items-center justify-center text-text-secondary">
          <span className="text-xs">初始化中...</span>
        </div>
      </div>
    );
  }

  if (state.type === 'empty') {
    return (
      <div className="mermaid-preview-container border-t border-glass-border bg-glass-bg-subtle px-4 py-6">
        <p className="text-center text-xs text-text-secondary">
          输入 Mermaid 代码后自动预览
        </p>
      </div>
    );
  }

  if (state.type === 'loading') {
    return (
      <div className="mermaid-preview-container border-t border-glass-border bg-glass-bg-subtle px-4 py-6">
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-border-secondary border-t-transparent" />
          <span className="text-xs text-text-secondary">渲染中...</span>
        </div>
      </div>
    );
  }

  if (state.type === 'error') {
    return (
      <div className="mermaid-preview-container border-t border-red-200 bg-red-50 px-4 py-4">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-xs text-red-500">&#9888;</span>
          <div className="flex-1">
            <p className="text-xs font-medium text-red-700">渲染失败</p>
            <p className="mt-1 text-xs text-red-600 font-mono">{state.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // success
  return (
    <div className="mermaid-preview-container border-t border-glass-border bg-glass-bg-subtle px-4 py-4">
      {/* Mermaid SVG 样式覆盖（覆盖内联 max-width） */}
      <style>{`
        .mermaid-svg-container svg {
          max-width: 100% !important;
          width: 100% !important;
          height: auto !important;
        }
      `}</style>
      {/* 工具栏 */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-text-secondary">预览</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleExpand}
            className="rounded px-2 py-0.5 text-xs text-text-secondary hover:bg-glass-bg-hover hover:text-text-primary transition-colors"
            title="全屏查看"
          >
            全屏
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded px-2 py-0.5 text-xs text-text-secondary hover:bg-glass-bg-hover hover:text-text-primary transition-colors"
            title="下载 SVG"
          >
            下载
          </button>
        </div>
      </div>
      {/* SVG 渲染区域 */}
      <div
        className="mermaid-svg-container overflow-auto rounded border border-glass-border bg-white p-4"
        dangerouslySetInnerHTML={{ __html: state.svg }}
      />
    </div>
  );
}
