/**
 * @fileoverview useCommands 自定义 Hook
 * @description 提供全局命令列表，包括快捷命令和搜索结果
 */

import { useMemo, useCallback } from 'react';

/**
 * 命令类型定义
 */
export interface Command {
  /** 命令唯一标识 */
  id: string;
  /** 命令名称 */
  label: string;
  /** 命令描述 */
  description?: string;
  /** 命令分类 */
  category: 'navigation' | 'action' | 'article' | 'tag';
  /** 关键词（用于搜索匹配） */
  keywords?: string[];
  /** 图标 */
  icon?: React.ReactNode;
  /** 执行回调 */
  action: () => void;
  /** 快捷键提示 */
  shortcut?: string;
}

/**
 * 命令组定义
 */
export interface CommandGroup {
  /** 组名称 */
  name: string;
  /** 组内命令 */
  commands: Command[];
}

/**
 * Hook 返回值
 */
interface UseCommandsReturn {
  /** 所有命令 */
  commands: Command[];
  /** 按组分类的命令 */
  groupedCommands: CommandGroup[];
  /** 搜索命令 */
  searchCommands: (query: string) => Command[];
}

/**
 * 全局命令 Hook
 * @param params - 参数
 * @returns 命令列表和搜索功能
 */
export function useCommands(params?: {
  articles?: Array<{ slug: string; title: string; description?: string }>;
  tags?: string[];
  onNavigate?: (path: string) => void;
  onToggleTheme?: () => void;
}): UseCommandsReturn {
  const {
    articles = [],
    tags = [],
    onNavigate,
    onToggleTheme,
  } = params || {};

  // 基础命令列表
  const baseCommands = useMemo<Command[]>(() => [
    // 导航命令
    {
      id: 'nav-home',
      label: '首页',
      description: '返回网站首页',
      category: 'navigation',
      keywords: ['home', 'index', '首页'],
      action: () => onNavigate?.('/'),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'nav-blog',
      label: '博客',
      description: '浏览所有文章',
      category: 'navigation',
      keywords: ['blog', '文章', '博客'],
      action: () => onNavigate?.('/blog'),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      id: 'nav-projects',
      label: '项目',
      description: '查看我的项目作品',
      category: 'navigation',
      keywords: ['projects', '作品', '项目'],
      action: () => onNavigate?.('/projects'),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'nav-about',
      label: '关于',
      description: '了解更多关于我的信息',
      category: 'navigation',
      keywords: ['about', '关于', '作者'],
      action: () => onNavigate?.('/about'),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    // 操作命令
    {
      id: 'action-theme-dark',
      label: '切换暗色主题',
      description: '切换到暗色模式',
      category: 'action',
      keywords: ['theme', 'dark', '主题', '暗色'],
      action: () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        onToggleTheme?.();
      },
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      id: 'action-theme-light',
      label: '切换亮色主题',
      description: '切换到亮色模式',
      category: 'action',
      keywords: ['theme', 'light', '主题', '亮色'],
      action: () => {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        onToggleTheme?.();
      },
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ], [onNavigate, onToggleTheme]);

  // 文章命令
  const articleCommands = useMemo<Command[]>(() =>
    articles.map((article) => ({
      id: `article-${article.slug}`,
      label: article.title,
      description: article.description,
      category: 'article' as const,
      keywords: [article.title, article.slug],
      action: () => onNavigate?.(`/blog/${article.slug}`),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    })),
  [articles, onNavigate]);

  // 标签命令
  const tagCommands = useMemo<Command[]>(() =>
    tags.map((tag) => ({
      id: `tag-${tag}`,
      label: tag,
      description: `查看标签 "${tag}" 下的所有文章`,
      category: 'tag' as const,
      keywords: [tag, 'tag', '标签'],
      action: () => onNavigate?.(`/tags/${tag}`),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    })),
  [tags, onNavigate]);

  // 所有命令
  const commands = useMemo<Command[]>(() => [
    ...baseCommands,
    ...articleCommands,
    ...tagCommands,
  ], [baseCommands, articleCommands, tagCommands]);

  // 分组命令
  const groupedCommands = useMemo<CommandGroup[]>(() => [
    { name: '导航', commands: baseCommands.filter(c => c.category === 'navigation') },
    { name: '操作', commands: baseCommands.filter(c => c.category === 'action') },
    { name: '文章', commands: articleCommands },
    { name: '标签', commands: tagCommands },
  ], [baseCommands, articleCommands, tagCommands]);

  // 搜索命令
  const searchCommands = useCallback((query: string): Command[] => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter((command) => {
      const matchLabel = command.label.toLowerCase().includes(lowerQuery);
      const matchKeywords = command.keywords?.some(k =>
        k.toLowerCase().includes(lowerQuery)
      );
      const matchDescription = command.description?.toLowerCase().includes(lowerQuery);
      return matchLabel || matchKeywords || matchDescription;
    });
  }, [commands]);

  return {
    commands,
    groupedCommands,
    searchCommands,
  };
}

export default useCommands;