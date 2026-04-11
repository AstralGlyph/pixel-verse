/**
 * @fileoverview CommandPalette 命令面板组件
 * @description 全局命令面板，支持快捷键唤起、模糊搜索、键盘导航
 */

import {
  type ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useCommands, type Command } from './hooks/useCommands';

/**
 * CommandPalette 组件属性
 */
export interface CommandPaletteProps {
  /** 文章列表 */
  articles?: Array<{ slug: string; title: string; description?: string }>;
  /** 标签列表 */
  tags?: string[];
  /** 导航回调 */
  onNavigate?: (path: string) => void;
  /** 额外类名 */
  className?: string;
}

/**
 * CommandPalette 命令面板组件
 */
export function CommandPalette({
  articles = [],
  tags = [],
  onNavigate,
  className = '',
}: CommandPaletteProps): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 获取命令
  const { searchCommands, groupedCommands } = useCommands({
    articles,
    tags,
    onNavigate: (path) => {
      setIsOpen(false);
      setQuery('');
      onNavigate?.(path);
    },
  });

  // 搜索结果
  const filteredCommands = useMemo(() => {
    return searchCommands(query);
  }, [searchCommands, query]);

  // 打开面板
  const openPalette = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
    // 延迟聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  // 关闭面板
  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  // 执行命令
  const executeCommand = useCallback((command: Command) => {
    command.action();
    closePalette();
  }, [closePalette]);

  // 监听快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K 打开面板
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closePalette();
        } else {
          openPalette();
        }
      }

      // Escape 关闭面板
      if (e.key === 'Escape' && isOpen) {
        closePalette();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openPalette, closePalette]);

  // 监听自定义事件
  useEffect(() => {
    const handleOpen = () => openPalette();
    document.addEventListener('open-command-palette', handleOpen);
    return () => document.removeEventListener('open-command-palette', handleOpen);
  }, [openPalette]);

  // 键盘导航
  const handleListKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
    }
  }, [filteredCommands, selectedIndex, executeCommand]);

  // 滚动到选中项
  useEffect(() => {
    if (listRef.current && filteredCommands.length > 0) {
      const selectedElement = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, filteredCommands.length]);

  // 查询变化时重置选中索引
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closePalette}
        aria-hidden="true"
      />

      {/* 面板容器 */}
      <div className="flex items-start justify-center pt-[15vh] px-4">
        <div
          className="relative w-full max-w-xl bg-bg border border-border rounded-xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="命令面板"
        >
          {/* 搜索输入 */}
          <div className="flex items-center border-b border-border">
            <svg
              className="w-5 h-5 ml-4 text-text-tertiary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleListKeyDown}
              placeholder="搜索文章、命令..."
              className="flex-1 px-4 py-4 bg-transparent text-text-primary placeholder-text-tertiary focus:outline-none"
              aria-label="搜索"
              aria-autocomplete="list"
              aria-controls="command-list"
              aria-activedescendant={
                filteredCommands[selectedIndex]
                  ? `command-${filteredCommands[selectedIndex].id}`
                  : undefined
              }
            />
            <kbd className="mr-4 px-2 py-1 text-xs text-text-tertiary bg-bg-tertiary rounded">
              ESC
            </kbd>
          </div>

          {/* 命令列表 */}
          <div
            ref={listRef}
            id="command-list"
            className="max-h-[60vh] overflow-y-auto p-2"
            role="listbox"
          >
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-text-tertiary">
                未找到相关结果
              </div>
            ) : (
              query.trim() === '' ? (
                // 无搜索时按组显示
                groupedCommands.map((group) => {
                  const groupCommands = group.commands;
                  if (groupCommands.length === 0) return null;

                  return (
                    <div key={group.name} className="mb-2">
                      <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase">
                        {group.name}
                      </div>
                      {groupCommands.map((command) => {
                        const globalIndex = filteredCommands.indexOf(command);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={command.id}
                            id={`command-${command.id}`}
                            data-index={globalIndex}
                            onClick={() => executeCommand(command)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                              ${isSelected
                                ? 'bg-accent/10 text-accent'
                                : 'text-text-primary hover:bg-bg-tertiary'
                              }
                            `}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <span className="flex-shrink-0 text-text-tertiary">
                              {command.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {command.label}
                              </div>
                              {command.description && (
                                <div className="text-sm text-text-tertiary truncate">
                                  {command.description}
                                </div>
                              )}
                            </div>
                            {command.shortcut && (
                              <kbd className="px-2 py-0.5 text-xs text-text-tertiary bg-bg-tertiary rounded">
                                {command.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                // 有搜索时显示过滤结果
                filteredCommands.map((command, index) => {
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={command.id}
                      id={`command-${command.id}`}
                      data-index={index}
                      onClick={() => executeCommand(command)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                        ${isSelected
                          ? 'bg-accent/10 text-accent'
                          : 'text-text-primary hover:bg-bg-tertiary'
                        }
                      `}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="flex-shrink-0 text-text-tertiary">
                        {command.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {command.label}
                        </div>
                        {command.description && (
                          <div className="text-sm text-text-tertiary truncate">
                            {command.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>

          {/* 底部提示 */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-text-tertiary">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 bg-bg-tertiary rounded">↑</kbd>
                <kbd className="px-1 bg-bg-tertiary rounded">↓</kbd>
                导航
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 bg-bg-tertiary rounded">Enter</kbd>
                选择
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-bg-tertiary rounded">Esc</kbd>
              关闭
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;