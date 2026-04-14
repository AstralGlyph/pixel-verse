// src/admin/components/editor/components/MermaidBlockView.tsx
/**
 * @fileoverview MermaidBlock 的 TipTap React Node View
 * @description 渲染可编辑的代码区域和下方的 MermaidPreview
 * @dependencies @tiptap/react, ../components/MermaidPreview, ../extensions/mermaid
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { MermaidPreview } from './MermaidPreview';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

interface MermaidBlockViewProps {
  node: any;
  getPos: () => number | undefined;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  editor: any;
}

export function MermaidBlockView({ node, getPos, updateAttributes, editor }: MermaidBlockViewProps) {
  const previewOpen = node.attrs.previewOpen ?? true;
  const nodeRef = useRef(node);
  nodeRef.current = node;

  // 初始化时从节点读取已有内容
  const initialCode = node.textContent || '';
  const [code, setCode] = useState(initialCode);

  // 从 TipTap 事务中同步代码内容（只监听当前节点的事务）
  useEffect(() => {
    if (!editor) return;

    const handleTransaction = () => {
      const pos = getPos();
      if (typeof pos !== 'number') return;
      const currentNode = editor.state.doc.nodeAt(pos);
      if (!currentNode) return;
      nodeRef.current = currentNode;
      setCode(currentNode.textContent || '');
    };

    editor.on('transaction', handleTransaction);

    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor, getPos]);

  const togglePreview = useCallback(() => {
    updateAttributes({ previewOpen: !previewOpen });
  }, [previewOpen, updateAttributes]);

  if (!previewOpen) {
    return (
      <NodeViewWrapper className="mermaid-block-wrapper my-4">
        <div className="mermaid-block-header flex items-center gap-2 rounded-t-md border border-glass-border bg-glass-bg-subtle px-3 py-2">
          <button
            type="button"
            onClick={togglePreview}
            className="text-text-secondary hover:text-text-primary transition-colors"
            title="展开预览"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium text-text-secondary">Mermaid 图表</span>
        </div>
        <NodeViewContent className="mermaid-block-code" />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="mermaid-block-wrapper my-4">
      <div className="mermaid-block-header flex items-center gap-2 rounded-t-md border border-b-0 border-glass-border bg-glass-bg-subtle px-3 py-2">
        <button
          type="button"
          onClick={togglePreview}
          className="text-text-secondary hover:text-text-primary transition-colors"
          title="折叠预览"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-text-secondary">Mermaid 图表</span>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteNode('mermaidBlock').run()}
          className="ml-auto text-text-secondary hover:text-red-500 transition-colors"
          title="删除"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <NodeViewContent className="mermaid-block-code border-x border-glass-border min-h-[60px] px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre" />

      <MermaidPreview code={code} theme={node.attrs.theme || 'default'} />
    </NodeViewWrapper>
  );
}
