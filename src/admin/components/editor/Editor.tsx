/**
 * @fileoverview TipTap 富文本编辑器 — 白色主题
 * @description 简洁白色主题：白色背景、浅色工具栏、悬浮/气泡菜单、语法高亮、排版优化
 * @dependencies @tiptap/react, @tiptap/starter-kit, @tiptap/extension-*, lowlight
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Typography from '@tiptap/extension-typography';
import FileHandler from '@tiptap/extension-file-handler';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import Details from '@tiptap/extension-details';
import DetailsSummary from '@tiptap/extension-details-summary';
import DetailsContent from '@tiptap/extension-details-content';
import UniqueID from '@tiptap/extension-unique-id';
import Audio from '@tiptap/extension-audio';
import MediaPicker from '../media/MediaPicker';
import { createLowlight, all } from 'lowlight';
import { Markdown } from '@tiptap/markdown';
import { isMarkdown } from '../../../lib/utils/isMarkdown';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Highlighter,
  Palette,
  Strikethrough,
  Type,
  ChevronDown,
  Plus,
  Trash2,
  Rows,
  Columns,
  GripVertical,
} from 'lucide-react';

// 创建 lowlight 实例并注册所有常用语言
const lowlight = createLowlight(all);

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  charLimit?: number;
}

const COLORS = [
  '#FFFFFF', '#A8A29E', '#78716C', '#57534E',
  '#FBBF24', '#F59E0B', '#D97706',
  '#F87171', '#EF4444', '#DC2626',
  '#FB923C', '#F97316', '#EA580C',
  '#FACC15', '#EAB308', '#CA8A04',
  '#A3E635', '#84CC16', '#65A30D',
  '#34D399', '#10B981', '#059669',
  '#22D3EE', '#06B6D4', '#0891B2',
  '#60A5FA', '#3B82F6', '#2563EB',
  '#A78BFA', '#8B5CF6', '#7C3AED',
  '#F472B6', '#EC4899', '#DB2777',
];

const HIGHLIGHT_COLORS = [
  { color: '#FBBF24', label: '琥珀' },
  { color: '#34D399', label: '翡翠' },
  { color: '#60A5FA', label: '天蓝' },
  { color: '#A78BFA', label: '紫罗兰' },
  { color: '#F472B6', label: '玫瑰' },
  { color: '#FB923C', label: '橘橙' },
  { color: '#F87171', label: '珊瑚' },
  { color: '#6B7280', label: '石墨' },
];

type ToolbarGroup = 'format' | 'font' | 'align' | 'list' | 'insert' | 'history';

interface GroupDef {
  id: ToolbarGroup;
  label: string;
  icon: React.ElementType;
}

const GROUPS: GroupDef[] = [
  { id: 'format', label: '格式', icon: Type },
  { id: 'font', label: '字体', icon: Type },
  { id: 'align', label: '对齐', icon: AlignLeft },
  { id: 'list', label: '列表', icon: List },
  { id: 'insert', label: '插入', icon: Plus },
  { id: 'history', label: '历史', icon: Undo },
];

export function Editor({ content, onChange, placeholder, charLimit }: EditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [activeGroup, setActiveGroup] = useState<ToolbarGroup | null>('format');
  const [charCount, setCharCount] = useState({ characters: 0, words: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const [bubbleMenuVisible, setBubbleMenuVisible] = useState(false);
  const [bubbleMenuStyle, setBubbleMenuStyle] = useState<React.CSSProperties>({});
  const [floatingMenuVisible, setFloatingMenuVisible] = useState(false);
  const [floatingMenuStyle, setFloatingMenuStyle] = useState<React.CSSProperties>({});
  const [dragHandleVisible, setDragHandleVisible] = useState(false);
  const [dragHandleStyle, setDragHandleStyle] = useState<React.CSSProperties>({});

  const isUpdatingRef = useRef(false);
  const editorRef = useRef<typeof editor>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const highlightPickerRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote: { HTMLAttributes: { class: 'zen-blockquote' } },
        codeBlock: false, // 使用 CodeBlockLowlight 替代
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount.configure({ limit: charLimit }),
      Placeholder.configure({
        placeholder: placeholder || '开始你的创作...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      Typography,
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
        onDrop: (editor, files) => {
          files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              if (file.type.startsWith('image/')) {
                editor.chain().setImage({ src: result }).focus().run();
              } else if (file.type.startsWith('audio/')) {
                editor.chain().setAudio({ src: result }).focus().run();
              }
            };
            reader.readAsDataURL(file);
          });
        },
        onPaste: (editor, files) => {
          files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              if (file.type.startsWith('image/')) {
                editor.chain().setImage({ src: result }).focus().run();
              } else if (file.type.startsWith('audio/')) {
                editor.chain().setAudio({ src: result }).focus().run();
              }
            };
            reader.readAsDataURL(file);
          });
        },
      }),
      FontFamily,
      FontSize,
      Details,
      DetailsSummary,
      DetailsContent,
      UniqueID.configure({
        attributeName: 'id',
        types: ['heading', 'paragraph', 'blockquote', 'codeBlock', 'bulletList', 'orderedList', 'taskList', 'table', 'details'],
      }),
      Audio,
      Markdown.configure({
        indentation: { style: 'space', size: 2 },
      }),
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      if (!isUpdatingRef.current) {
        onChange(ed.getHTML());
      }
      setCharCount({
        characters: ed.storage.characterCount.characters(),
        words: ed.storage.characterCount.words(),
      });
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px]',
      },
      handlePaste: (_view, event: ClipboardEvent) => {
        const text = event.clipboardData?.getData('text/plain');
        const html = event.clipboardData?.getData('text/html');

        // 如果剪贴板有 HTML 内容，使用默认行为（保留富文本粘贴）
        if (html && html.trim().length > 0) {
          return false;
        }

        // 检测纯文本是否包含 Markdown 语法
        if (text && isMarkdown(text)) {
          event.preventDefault();
          const editorInstance = editorRef.current;
          if (!editorInstance) return true;
          const parse = editorInstance.markdown?.parse?.bind(editorInstance.markdown);
          if (parse) {
            try {
              const jsonContent = parse(text);
              editorInstance.chain().focus().insertContent(jsonContent).run();
            } catch {
              // Markdown 解析产生的 mark 组合可能与 schema 冲突（如 bold+code），
              // 降级为普通文本插入，由 TipTap 自动识别内联语法
              editorInstance.chain().focus().insertContent(text).run();
            }
          } else {
            // 降级为普通文本插入
            editorInstance.chain().focus().insertContent(text).run();
          }
          return true;
        }

        return false; // 非 Markdown 内容使用默认处理
      },
    },
  });

  // 同步 editor 到 ref，供 handlePaste 使用
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // 同步外部 content
  useEffect(() => {
    if (!editor) return;
    const currentContent = editor.getHTML();
    if (content !== currentContent) {
      isUpdatingRef.current = true;
      editor.commands.setContent(content);
      isUpdatingRef.current = false;
      setCharCount({
        characters: editor.storage.characterCount.characters(),
        words: editor.storage.characterCount.words(),
      });
    }
  }, [content, editor]);

  // 气泡菜单 & 浮动菜单 — 监听选区变化
  useEffect(() => {
    if (!editor || !editorContainerRef.current) return;

    const updateMenus = () => {
      const { state } = editor;
      const { selection } = state;
      const empty = selection.empty;

      if (!empty) {
        // 气泡菜单：选中文字时显示
        const { view } = editor;
        const startCoords = view.coordsAtPos(selection.from);
        const endCoords = view.coordsAtPos(selection.to);
        const containerRect = editorContainerRef.current!.getBoundingClientRect();
        // 气泡菜单高度约 40px，定位在选区上方 12px 处
        const menuHeight = 40;
        const centerX = (startCoords.left + endCoords.left) / 2 - containerRect.left;
        const topY = startCoords.top - containerRect.top - menuHeight - 12;
        setBubbleMenuStyle({
          top: Math.max(4, topY),
          left: centerX,
          transform: 'translateX(-50%)',
          position: 'absolute' as const,
          zIndex: 40,
        });
        setBubbleMenuVisible(true);
        setFloatingMenuVisible(false);
      } else {
        // 浮动菜单：光标在空行时显示
        const { $anchor } = selection;
        const isEmptyLine = $anchor.parent.type.name === 'paragraph' && $anchor.parent.content.size === 0;
        if (isEmptyLine) {
          const { view } = editor;
          const coords = view.coordsAtPos(selection.from);
          const containerRect = editorContainerRef.current!.getBoundingClientRect();
          setFloatingMenuStyle({
            top: coords.top - containerRect.top,
            left: -8,
            position: 'absolute' as const,
            zIndex: 40,
          });
          setFloatingMenuVisible(true);
        } else {
          setFloatingMenuVisible(false);
        }
        setBubbleMenuVisible(false);
      }
    };

    editor.on('selectionUpdate', updateMenus);
    editor.on('focus', updateMenus);
    editor.on('blur', () => {
      setBubbleMenuVisible(false);
      setFloatingMenuVisible(false);
    });

    return () => {
      editor.off('selectionUpdate', updateMenus);
      editor.off('focus', updateMenus);
      editor.off('blur');
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    setCharCount({
      characters: editor.storage.characterCount.characters(),
      words: editor.storage.characterCount.words(),
    });
  }, [editor]);

  // 点击外部关闭弹出菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(e.target as Node)) {
        setShowHighlightPicker(false);
      }
      if (tableMenuRef.current && !tableMenuRef.current.contains(e.target as Node)) {
        setShowTableMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addImageFromUrl = useCallback(() => {
    const url = window.prompt('请输入图片 URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleMediaSelect = useCallback((url: string, altText: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url, alt: altText }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('输入链接地址:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    setShowTableMenu(true);
  }, [editor]);

  // 拖拽手柄 — 鼠标悬停在段落左侧时显示
  const handleEditorMouseMove = useCallback((e: React.MouseEvent) => {
    if (!editor || !editorContainerRef.current) return;
    const containerRect = editorContainerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    // 只在左侧 30px 区域内显示拖拽手柄
    if (x < 30) {
      const pos = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (pos) {
        const $pos = editor.view.state.doc.resolve(pos.pos);
        const nodeType = $pos.parent.type.name;
        const showable = ['paragraph', 'heading', 'bulletList', 'orderedList', 'taskList', 'taskItem', 'blockquote', 'codeBlock'].includes(nodeType);
        if (showable) {
          setDragHandleVisible(true);
          setDragHandleStyle({
            top: y - 10,
            left: 8,
            position: 'absolute',
            zIndex: 30,
          });
          return;
        }
      }
    }
    setDragHandleVisible(false);
  }, [editor]);

  const handleEditorMouseLeave = useCallback(() => {
    setDragHandleVisible(false);
  }, []);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-[500px] rounded-xl glass-card text-text-tertiary">
        编辑器加载中...
      </div>
    );
  }

  const isActive = (type: string | Record<string, unknown>, attrs?: Record<string, unknown>) =>
    typeof type === 'string' ? editor.isActive(type, attrs) : editor.isActive(type);

  const ToolbarButton = ({
    onClick,
    isActive: active,
    icon: Icon,
    title,
    className = '',
  }: {
    onClick: () => void;
    isActive?: boolean;
    icon: React.ElementType;
    title: string;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md p-1.5 transition-all duration-150 ${
        active
          ? 'bg-accent-primary/15 text-accent-primary'
          : 'text-text-secondary hover:bg-glass-bg-hover hover:text-text-primary'
      } ${className}`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div ref={editorContainerRef} className="relative rounded-xl overflow-hidden glass-card shadow-glass-lg">
      {/* ===== 气泡菜单 — 选中文本时弹出 ===== */}
      {bubbleMenuVisible && (
        <div
          style={bubbleMenuStyle}
          className="flex items-center gap-0.5 rounded-xl border border-glass-border bg-glass-bg-subtle backdrop-blur px-1.5 py-1 shadow-glass animate-in"
        >
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={isActive('bold')} icon={Bold} title="粗体" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={isActive('italic')} icon={Italic} title="斜体" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={isActive('underline')} icon={UnderlineIcon} title="下划线" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={isActive('strike')} icon={Strikethrough} title="删除线" />
          <div className="mx-0.5 h-4 w-px bg-glass-border" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={isActive('code')} icon={Code} title="行内代码" />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('链接地址:', editor.getAttributes('link').href || 'https://');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            isActive={isActive('link')}
            icon={LinkIcon}
            title="链接"
          />
          <div className="mx-0.5 h-4 w-px bg-glass-border" />
          <ToolbarButton
            onClick={() => {
              const color = window.prompt('颜色 (hex):', '#fbbf24');
              if (color) editor.chain().focus().setColor(color).run();
            }}
            icon={Palette}
            title="文字颜色"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={isActive('highlight')}
            icon={Highlighter}
            title="高亮"
          />
        </div>
      )}

      {/* ===== 浮动菜单 — 空行时弹出快捷插入 ===== */}
      {floatingMenuVisible && (
        <div
          style={floatingMenuStyle}
          className="flex flex-col gap-0.5 rounded-xl border border-glass-border bg-glass-bg-subtle backdrop-blur p-1.5 shadow-glass animate-in"
        >
          {([1, 2, 3] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={`rounded-md px-2 py-1 text-[11px] font-bold transition-all ${
                isActive('heading', { level })
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-text-tertiary hover:bg-glass-bg-hover hover:text-text-primary'
              }`}
              title={`标题 ${level}`}
            >
              H{level}
            </button>
          ))}
          <div className="my-0.5 h-px bg-glass-border" />
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-glass-bg-hover hover:text-text-primary" title="无序列表">
            <List className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-glass-bg-hover hover:text-text-primary" title="有序列表">
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-glass-bg-hover hover:text-text-primary" title="引用">
            <Quote className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-glass-bg-hover hover:text-text-primary" title="代码块">
            <Code className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-glass-bg-hover hover:text-text-primary" title="分割线">
            <span className="text-xs leading-none">—</span>
          </button>
        </div>
      )}

      {/* ===== 顶部工具栏 ===== */}
      <div className="relative z-10 border-b border-glass-border bg-glass-bg-subtle backdrop-blur">
        {/* 分组标签栏 */}
        <div className="flex items-center gap-1 px-3 pt-2 pb-1">
          {GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                activeGroup === group.id
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-glass-bg-hover'
              }`}
            >
              <group.icon className="h-3.5 w-3.5" />
              {group.label}
            </button>
          ))}
        </div>

        {/* 工具按钮区域 */}
        <div className="relative min-h-[48px] px-3 pb-2">
          {/* 格式 */}
          {activeGroup === 'format' && (
            <div className="flex flex-wrap items-center gap-1 animate-in">
              <div className="flex items-center gap-0.5">
                {([1, 2, 3] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition-all duration-150 ${
                      isActive('heading', { level })
                        ? 'bg-accent-primary/15 text-accent-primary'
                        : 'text-text-secondary hover:bg-glass-bg-hover hover:text-text-primary'
                    }`}
                  >
                    H{level}
                  </button>
                ))}
              </div>

              <div className="mx-1.5 h-5 w-px bg-glass-border" />

              <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={isActive('bold')} icon={Bold} title="粗体" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={isActive('italic')} icon={Italic} title="斜体" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={isActive('underline')} icon={UnderlineIcon} title="下划线" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={isActive('strike')} icon={Strikethrough} title="删除线" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={isActive('code')} icon={Code} title="行内代码" />

              <div className="mx-1.5 h-5 w-px bg-glass-border" />

              {/* 文字颜色 */}
              <div className="relative" ref={colorPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={`rounded-md p-1.5 transition-all duration-150 ${
                    showColorPicker
                      ? 'bg-accent-primary/15 text-accent-primary'
                      : 'text-text-secondary hover:bg-glass-bg-hover hover:text-text-primary'
                  }`}
                  title="文字颜色"
                >
                  <Palette className="h-4 w-4" />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 z-50 mt-2 w-56 rounded-xl border border-glass-border bg-glass-bg-subtle backdrop-blur p-3 shadow-2xl shadow-black/60">
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-text-tertiary">文字颜色</p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="h-6 w-6 rounded-md border border-glass-border transition-transform hover:scale-110 active:scale-95"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            editor.chain().focus().setColor(color).run();
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-2 w-full rounded-md border border-glass-border px-2 py-1 text-[10px] uppercase tracking-wider text-text-tertiary transition-colors hover:bg-glass-bg-hover hover:text-text-secondary"
                      onClick={() => {
                        editor.chain().focus().unsetColor().run();
                        setShowColorPicker(false);
                      }}
                    >
                      默认颜色
                    </button>
                  </div>
                )}
              </div>

              {/* 高亮 */}
              <div className="relative" ref={highlightPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                  className={`rounded-md p-1.5 transition-all duration-150 ${
                    showHighlightPicker
                      ? 'bg-accent-primary/15 text-accent-primary'
                      : 'text-text-secondary hover:bg-glass-bg-hover hover:text-text-primary'
                  }`}
                  title="高亮"
                >
                  <Highlighter className="h-4 w-4" />
                </button>
                {showHighlightPicker && (
                  <div className="absolute top-full left-0 z-50 mt-2 rounded-xl border border-glass-border bg-glass-bg-subtle backdrop-blur p-3 shadow-2xl shadow-black/60">
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-text-tertiary">背景高亮</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {HIGHLIGHT_COLORS.map(({ color, label }) => (
                        <button
                          key={color}
                          type="button"
                          className="h-7 w-9 rounded-md border border-glass-border transition-transform hover:scale-110 active:scale-95"
                          style={{ backgroundColor: color }}
                          title={label}
                          onClick={() => {
                            editor.chain().focus().toggleHighlight({ color }).run();
                            setShowHighlightPicker(false);
                          }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-2 w-full rounded-md border border-glass-border px-2 py-1 text-[10px] uppercase tracking-wider text-text-tertiary transition-colors hover:bg-glass-bg-hover hover:text-text-secondary"
                      onClick={() => {
                        editor.chain().focus().unsetHighlight().run();
                        setShowHighlightPicker(false);
                      }}
                    >
                      清除高亮
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 字体 */}
          {activeGroup === 'font' && (
            <div className="flex flex-wrap items-center gap-1">
              {/* 字体选择 */}
              <select
                className="rounded-md bg-glass-bg-subtle border border-transparent px-2 py-1.5 text-xs text-text-secondary focus:border-accent-primary/40 focus:outline-none"
                value={editor.getAttributes('textStyle').fontFamily || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    editor.chain().focus().setFontFamily(e.target.value).run();
                  } else {
                    editor.chain().focus().unsetFontFamily().run();
                  }
                }}
              >
                <option value="">默认字体</option>
                <option value="'Inter', sans-serif">Inter (无衬线)</option>
                <option value="'Noto Sans SC', sans-serif">思源黑体</option>
                <option value="'Noto Serif SC', serif">思源宋体</option>
                <option value="Georgia, 'Noto Serif SC', serif">Georgia (衬线)</option>
                <option value="'JetBrains Mono', monospace">JetBrains Mono (等宽)</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Arial, sans-serif">Arial (无衬线)</option>
              </select>

              <div className="mx-1.5 h-5 w-px bg-glass-border" />

              {/* 字号 */}
              <select
                className="rounded-md bg-glass-bg-subtle border border-transparent px-2 py-1.5 text-xs text-text-secondary focus:border-accent-primary/40 focus:outline-none"
                value={editor.getAttributes('textStyle').fontSize || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    editor.chain().focus().setFontSize(e.target.value).run();
                  } else {
                    editor.chain().focus().unsetFontSize().run();
                  }
                }}
              >
                <option value="">默认字号</option>
                <option value="10px">极小 (10px)</option>
                <option value="12px">小 (12px)</option>
                <option value="14px">较小 (14px)</option>
                <option value="16px">正常 (16px)</option>
                <option value="18px">较大 (18px)</option>
                <option value="24px">大 (24px)</option>
                <option value="32px">较大 (32px)</option>
                <option value="48px">极大 (48px)</option>
              </select>
            </div>
          )}

          {/* 对齐 */}
          {activeGroup === 'align' && (
            <div className="flex flex-wrap items-center gap-1">
              {([
                { align: 'left' as const, icon: AlignLeft, label: '左对齐' },
                { align: 'center' as const, icon: AlignCenter, label: '居中' },
                { align: 'right' as const, icon: AlignRight, label: '右对齐' },
                { align: 'justify' as const, icon: AlignJustify, label: '两端对齐' },
              ]).map(({ align, icon: Icon, label }) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign(align).run()}
                  className={`rounded-md p-1.5 transition-all duration-150 ${
                    isActive({ textAlign: align })
                      ? 'bg-accent-primary/15 text-accent-primary'
                      : 'text-text-secondary hover:bg-glass-bg-hover hover:text-text-primary'
                  }`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}

          {/* 列表 */}
          {activeGroup === 'list' && (
            <div className="flex flex-wrap items-center gap-1">
              <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={isActive('bulletList')} icon={List} title="无序列表" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={isActive('orderedList')} icon={ListOrdered} title="有序列表" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={isActive('taskList')} icon={ListTodo} title="任务列表" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={isActive('blockquote')} icon={Quote} title="引用" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={isActive('codeBlock')} icon={Code} title="代码块" />
              <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="rounded-md p-1.5 text-text-secondary transition-all duration-150 hover:bg-glass-bg-hover hover:text-text-primary"
                title="分割线"
              >
                <span className="text-sm leading-none">—</span>
              </button>
            </div>
          )}

          {/* 插入 */}
          {activeGroup === 'insert' && (
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-all duration-150 hover:bg-glass-bg-hover hover:text-text-primary"
              >
                <ImageIcon className="h-4 w-4" />
                媒体库
              </button>
              <button
                type="button"
                onClick={addImageFromUrl}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-all duration-150 hover:bg-glass-bg-hover hover:text-text-primary"
              >
                <ImageIcon className="h-4 w-4" />
                图片 URL
              </button>
              <button
                type="button"
                onClick={setLink}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-all duration-150 ${
                  isActive('link')
                    ? 'bg-accent-primary/15 text-accent-primary'
                    : 'text-text-secondary hover:bg-glass-bg-hover hover:text-text-primary'
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                链接
              </button>
              <div className="relative" ref={tableMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (isActive('table')) {
                      setShowTableMenu(!showTableMenu);
                    } else {
                      insertTable();
                    }
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-all duration-150 ${
                    isActive('table')
                      ? 'bg-accent-primary/15 text-accent-primary'
                      : 'text-text-secondary hover:bg-glass-bg-hover hover:text-text-primary'
                  }`}
                >
                  <TableIcon className="h-4 w-4" />
                  表格
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showTableMenu && isActive('table') && (
                  <div className="absolute top-full left-0 z-50 mt-2 rounded-xl border border-glass-border bg-glass-bg-subtle backdrop-blur p-2 shadow-2xl shadow-black/60">
                    <div className="grid grid-cols-2 gap-1">
                      <button type="button" className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-text-secondary hover:bg-glass-bg-hover" onClick={() => editor.chain().focus().addColumnBefore().run()}>
                        <Columns className="h-3 w-3" /> 前列
                      </button>
                      <button type="button" className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-text-secondary hover:bg-glass-bg-hover" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                        <Columns className="h-3 w-3" /> 后列
                      </button>
                      <button type="button" className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-text-secondary hover:bg-glass-bg-hover" onClick={() => editor.chain().focus().addRowBefore().run()}>
                        <Rows className="h-3 w-3" /> 前行
                      </button>
                      <button type="button" className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-text-secondary hover:bg-glass-bg-hover" onClick={() => editor.chain().focus().addRowAfter().run()}>
                        <Rows className="h-3 w-3" /> 后行
                      </button>
                      <button type="button" className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-text-secondary hover:bg-glass-bg-hover" onClick={() => editor.chain().focus().deleteColumn().run()}>
                        <Trash2 className="h-3 w-3" /> 删列
                      </button>
                      <button type="button" className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-text-secondary hover:bg-glass-bg-hover" onClick={() => editor.chain().focus().deleteRow().run()}>
                        <Trash2 className="h-3 w-3" /> 删行
                      </button>
                    </div>
                    <button
                      type="button"
                      className="mt-1 flex w-full items-center gap-1.5 rounded-md border border-error/30 px-2 py-1.5 text-[11px] text-error hover:bg-error/10"
                      onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }}
                    >
                      <Trash2 className="h-3 w-3" /> 删除表格
                    </button>
                  </div>
                )}
              </div>

              {/* 折叠面板 */}
              <button
                type="button"
                onClick={() => editor.chain().focus().setDetails().run()}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-all duration-150 hover:bg-glass-bg-hover hover:text-text-primary"
                title="折叠面板"
              >
                <span className="text-sm">▸</span>
                折叠
              </button>

              {/* 音频 */}
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt('请输入音频 URL:');
                  if (url) editor.chain().focus().setAudio({ src: url }).run();
                }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-all duration-150 hover:bg-glass-bg-hover hover:text-text-primary"
                title="插入音频"
              >
                <span className="text-sm">♫</span>
                音频
              </button>
            </div>
          )}

          {/* 历史 */}
          {activeGroup === 'history' && (
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-all duration-150 hover:bg-glass-bg-hover hover:text-text-primary"
              >
                <Undo className="h-4 w-4" />
                撤销
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-all duration-150 hover:bg-glass-bg-hover hover:text-text-primary"
              >
                <Redo className="h-4 w-4" />
                重做
              </button>
            </div>
          )}

          {activeGroup === null && (
            <div className="flex items-center text-[11px] text-text-tertiary">
              点击上方分组展开工具
            </div>
          )}
        </div>
      </div>

      {/* ===== 编辑区 ===== */}
      <div
        className={`relative transition-colors duration-300 ${
          isFocused ? 'bg-glass-bg-subtle' : 'bg-glass-bg-subtle'
        }`}
        onMouseMove={handleEditorMouseMove}
        onMouseLeave={handleEditorMouseLeave}
      >
        {/* 拖拽手柄 */}
        {dragHandleVisible && (
          <div
            style={dragHandleStyle}
            className="flex items-center justify-center rounded-md border border-glass-border bg-glass-bg-subtle backdrop-blur p-1 cursor-grab active:cursor-grabbing hover:border-amber-500/40 transition-colors"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragEnd={() => {
              setDragHandleVisible(false);
            }}
            title="拖拽移动段落"
          >
            <GripVertical className="h-3.5 w-3.5 text-text-tertiary" />
          </div>
        )}

        <div
          className="px-6 py-5"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <EditorContent editor={editor} />
        </div>

        {/* 底部状态栏 */}
        <div className="flex items-center justify-between border-t border-glass-border/40 px-5 py-2">
          <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
            <span>{charCount.words} 词</span>
            <span className="text-text-tertiary/50">·</span>
            <span>{charCount.characters} 字符</span>
          </div>
          {charLimit && (
            <div className="flex items-center gap-2">
              <div className="h-1 w-20 rounded-full bg-glass-border">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    charCount.characters > charLimit
                      ? 'w-full bg-red-500'
                      : charCount.characters > charLimit * 0.8
                        ? 'w-[80%] bg-amber-500'
                        : 'bg-text-tertiary/40'
                  }`}
                  style={{ width: `${Math.min(100, (charCount.characters / charLimit) * 100)}%` }}
                />
              </div>
              <span
                className={`text-[11px] tabular-nums ${
                  charCount.characters > charLimit ? 'text-red-400' : 'text-text-tertiary'
                }`}
              >
                {charCount.characters}/{charLimit}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== 全局样式 ===== */}
      <style>{`
        /* ===== ProseMirror 核心 ===== */
        .ProseMirror {
          font-family: 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
          font-size: 16px;
          line-height: 1.85;
          color: #1a1a1a;
          caret-color: #f59e0b;
        }

        .ProseMirror > * + * {
          margin-top: 0.75em;
        }

        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3 {
          font-family: 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
          color: #111827;
          font-weight: 700;
          line-height: 1.3;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }

        .ProseMirror h1 {
          font-size: 2em;
          letter-spacing: -0.02em;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.3em;
        }

        .ProseMirror h2 {
          font-size: 1.5em;
          letter-spacing: -0.01em;
        }

        .ProseMirror h3 {
          font-size: 1.25em;
          color: #374151;
        }

        .ProseMirror p {
          color: #1a1a1a;
        }

        /* Placeholder */
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
        }

        /* 粗体/斜体/下划线 */
        .ProseMirror strong {
          font-weight: 700;
          color: #111827;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror u {
          text-decoration-color: #fbbf24;
          text-decoration-thickness: 2px;
          text-underline-offset: 3px;
        }

        /* 行内代码 */
        .ProseMirror code {
          background: #f3f4f6;
          border-radius: 4px;
          color: #d97706;
          font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
          font-size: 0.88em;
          padding: 0.2em 0.4em;
        }

        /* 代码块 — 语法高亮 */
        .ProseMirror pre {
          background: #1e293b;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1em 1.25em;
          margin: 1em 0;
          overflow-x: auto;
          position: relative;
        }

        .ProseMirror pre code {
          background: none;
          border-radius: 0;
          color: #e2e8f0;
          font-size: 0.85em;
          padding: 0;
          line-height: 1.7;
        }

        /* lowlight 语法高亮主题色 */
        .ProseMirror pre .hljs-keyword { color: #c084fc; }
        .ProseMirror pre .hljs-string { color: #86efac; }
        .ProseMirror pre .hljs-number { color: #fbbf24; }
        .ProseMirror pre .hljs-comment { color: #64748b; font-style: italic; }
        .ProseMirror pre .hljs-function { color: #60a5fa; }
        .ProseMirror pre .hljs-title { color: #fbbf24; }
        .ProseMirror pre .hljs-params { color: #e2e8f0; }
        .ProseMirror pre .hljs-built_in { color: #22d3ee; }
        .ProseMirror pre .hljs-type { color: #f472b6; }
        .ProseMirror pre .hljs-operator { color: #fb923c; }
        .ProseMirror pre .hljs-property { color: #67e8f9; }
        .ProseMirror pre .hljs-variable { color: #fca5a5; }
        .ProseMirror pre .hljs-tag { color: #f87171; }
        .ProseMirror pre .hljs-attr { color: #fbbf24; }
        .ProseMirror pre .hljs-attribute { color: #86efac; }
        .ProseMirror pre .hljs-meta { color: #a78bfa; }
        .ProseMirror pre .hljs-selector-class { color: #86efac; }
        .ProseMirror pre .hljs-selector-id { color: #fbbf24; }

        /* 引用 */
        .ProseMirror blockquote.zen-blockquote,
        .ProseMirror blockquote {
          border-left: 3px solid #f59e0b;
          margin: 1em 0;
          padding: 0.5em 0 0.5em 1.25em;
          color: #6b7280;
          font-style: italic;
        }

        /* 列表 */
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
        }

        .ProseMirror li {
          color: #1a1a1a;
          padding: 0.15em 0;
        }

        .ProseMirror li p {
          margin-top: 0.25em;
        }

        /* 任务列表 */
        .ProseMirror ul[data-type='taskList'] {
          list-style: none;
          padding: 0;
        }

        .ProseMirror ul[data-type='taskList'] li {
          display: flex;
          align-items: flex-start;
          gap: 0.6em;
          padding: 0.3em 0;
        }

        .ProseMirror ul[data-type='taskList'] li > label {
          flex: 0 0 auto;
          margin-top: 0.3em;
          user-select: none;
        }

        .ProseMirror ul[data-type='taskList'] li > label input[type='checkbox'] {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
        }

        .ProseMirror ul[data-type='taskList'] li > label input[type='checkbox']:checked {
          background: #fbbf24;
          border-color: #fbbf24;
        }

        .ProseMirror ul[data-type='taskList'] li > label input[type='checkbox']:checked::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 1px;
          width: 5px;
          height: 10px;
          border: solid #ffffff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .ProseMirror ul[data-type='taskList'] li > div {
          flex: 1;
        }

        /* 链接 */
        .ProseMirror a {
          color: #d97706;
          cursor: pointer;
          text-decoration: none;
          border-bottom: 1px solid rgba(217, 119, 6, 0.3);
          transition: border-color 0.15s ease;
        }

        .ProseMirror a:hover {
          border-bottom-color: #d97706;
        }

        /* 高亮 */
        .ProseMirror mark {
          border-radius: 3px;
          padding: 0.1em 0.25em;
        }

        /* 图片 */
        .ProseMirror img {
          border-radius: 10px;
          max-width: 100%;
          height: auto;
          margin: 1em 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #fbbf24;
          outline-offset: 2px;
        }

        /* 表格 */
        .ProseMirror table {
          border-collapse: collapse;
          margin: 1em 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .ProseMirror td,
        .ProseMirror th {
          border: 1px solid #e5e7eb;
          box-sizing: border-box;
          min-width: 1em;
          padding: 0.6em 0.8em;
          position: relative;
          vertical-align: top;
          color: #1a1a1a;
        }

        .ProseMirror th {
          background: #f9fafb;
          font-weight: 600;
          color: #111827;
        }

        .ProseMirror .selectedCell:after {
          background: rgba(251, 191, 36, 0.1);
          content: '';
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }

        .ProseMirror .column-resize-handle {
          background-color: #fbbf24;
          bottom: -2px;
          position: absolute;
          right: -2px;
          pointer-events: none;
          top: 0;
          width: 3px;
        }

        /* 分割线 */
        .ProseMirror hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1.5em 0;
        }

        /* 排版 Typography 优化 */
        .ProseMirror p + p {
          text-indent: 0;
        }

        .ProseMirror .ProseMirror-gapcursor {
          border-top-color: #fbbf24;
        }

        /* 折叠面板 Details */
        .ProseMirror details {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin: 0.75em 0;
          overflow: hidden;
        }

        .ProseMirror details summary {
          background: #f9fafb;
          padding: 0.5em 0.75em;
          cursor: pointer;
          font-weight: 600;
          color: #111827;
          user-select: none;
          list-style: none;
        }

        .ProseMirror details summary::-webkit-details-marker {
          display: none;
        }

        .ProseMirror details summary::before {
          content: '▸';
          display: inline-block;
          margin-right: 0.5em;
          transition: transform 0.15s ease;
        }

        .ProseMirror details[open] summary::before {
          transform: rotate(90deg);
        }

        .ProseMirror details summary::marker {
          display: none;
        }

        .ProseMirror details > div[data-type='detailsContent'] {
          padding: 0.75em;
          color: #1a1a1a;
        }

        /* 音频 */
        .ProseMirror audio {
          border-radius: 8px;
          margin: 1em 0;
          width: 100%;
          max-width: 100%;
        }

        /* 字体大小 */
        .ProseMirror span[style*='font-size'] {
          color: inherit;
        }

        /* 选中节点 */
        .ProseMirror ::selection {
          background: rgba(251, 191, 36, 0.2);
        }

        /* 动画 */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-in {
          animation: fadeIn 0.15s ease-out;
        }

        /* 滚动条 */
        .ProseMirror::-webkit-scrollbar {
          width: 6px;
        }

        .ProseMirror::-webkit-scrollbar-track {
          background: transparent;
        }

        .ProseMirror::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .ProseMirror::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      {/* 媒体选择器 */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}

export default Editor;
