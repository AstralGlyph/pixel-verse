/**
 * @fileoverview 编辑器大纲（Table of Contents）组件
 * @description 从 TipTap 编辑器内容中提取 H1/H2/H3 标题，显示为可点击跳转的大纲树
 * @dependencies @tiptap/react
 */

import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { ListTree, ChevronRight, ChevronDown } from 'lucide-react';

interface HeadingNode {
  id: string;
  text: string;
  level: 1 | 2 | 3;
  pos: number;
}

interface TableOfContentsProps {
  editor: Editor | null;
}

/**
 * 从编辑器文档中提取所有标题节点
 */
function extractHeadings(editor: Editor): HeadingNode[] {
  const headings: HeadingNode[] = [];
  if (!editor || !editor.state.doc) return headings;

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const level = node.attrs.level as 1 | 2 | 3;
      if (level >= 1 && level <= 3) {
        const id = node.attrs.id || '';
        const text = node.textContent || '';
        if (text.trim()) {
          headings.push({ id, text: text.trim(), level, pos });
        }
      }
    }
  });

  return headings;
}

/**
 * 大纲组件
 */
export function TableOfContents({ editor }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingNode[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [collapsed, setCollapsed] = useState(false);

  // 监听文档变化，提取标题
  const updateHeadings = useCallback(() => {
    if (!editor) return;
    const extracted = extractHeadings(editor);
    setHeadings(extracted);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    // 初始提取
    updateHeadings();

    // 监听文档变化
    editor.on('update', updateHeadings);
    editor.on('transaction', updateHeadings);

    return () => {
      editor.off('update', updateHeadings);
      editor.off('transaction', updateHeadings);
    };
  }, [editor, updateHeadings]);

  // 监听光标位置，高亮当前所在标题
  useEffect(() => {
    if (!editor) return;

    const updateActiveHeading = () => {
      const { state } = editor;
      const { selection } = state;
      const cursorPos = selection.from;

      // 找到光标所在位置最近的上方标题
      let lastHeading: HeadingNode | null = null;
      for (const heading of headings) {
        if (heading.pos <= cursorPos) {
          lastHeading = heading;
        } else {
          break;
        }
      }

      setActiveHeadingId(lastHeading?.id || '');
    };

    editor.on('selectionUpdate', updateActiveHeading);
    editor.on('focus', updateActiveHeading);

    return () => {
      editor.off('selectionUpdate', updateActiveHeading);
      editor.off('focus', updateActiveHeading);
    };
  }, [editor, headings]);

  // 点击标题跳转到对应位置
  const handleHeadingClick = useCallback(
    (pos: number) => {
      if (!editor) return;
      editor.commands.focus(pos, { scrollIntoView: true });
    },
    [editor]
  );

  if (!editor) return null;

  if (headings.length === 0) {
    return (
      <div className="rounded-xl border border-glass-border bg-glass-bg-subtle backdrop-blur p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <ListTree className="h-4 w-4" />
          大纲
        </div>
        <p className="mt-3 text-xs text-text-tertiary">
          使用标题（H1/H2/H3）来生成大纲
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-glass-border bg-glass-bg-subtle backdrop-blur">
      {/* 头部 */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4" />
          大纲
          <span className="text-[10px] text-text-tertiary">({headings.length})</span>
        </div>
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-text-tertiary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-tertiary" />
        )}
      </button>

      {/* 标题列表 */}
      {!collapsed && (
        <div className="max-h-[500px] overflow-y-auto px-3 pb-3">
          {headings.map((heading) => {
            const isActive = heading.id === activeHeadingId;
            const indentClass =
              heading.level === 1
                ? 'pl-2'
                : heading.level === 2
                  ? 'pl-5'
                  : 'pl-8';

            const textSizeClass =
              heading.level === 1
                ? 'text-sm font-semibold'
                : heading.level === 2
                  ? 'text-xs font-medium'
                  : 'text-xs';

            return (
              <button
                key={heading.id}
                type="button"
                onClick={() => handleHeadingClick(heading.pos)}
                className={`w-full truncate rounded-md py-1.5 text-left transition-all duration-150 ${indentClass} ${textSizeClass} ${
                  isActive
                    ? 'bg-accent-primary/15 text-accent-primary'
                    : 'text-text-tertiary hover:bg-glass-bg-hover hover:text-text-secondary'
                }`}
                title={heading.text}
              >
                {heading.text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TableOfContents;
