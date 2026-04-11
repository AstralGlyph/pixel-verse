/**
 * @fileoverview Search 搜索组件
 * @description 基于 Pagefind 的全文搜索组件
 */

import { type ReactNode, useState, useCallback, useRef, useEffect } from 'react';

/**
 * 搜索结果项
 */
export interface SearchResult {
  /** 结果 ID */
  id: string;
  /** 页面 URL */
  url: string;
  /** 页面标题 */
  title: string;
  /** 页面描述或摘要 */
  excerpt?: string;
  /** 高亮片段 */
  highlights?: string[];
  /** 关联分数 */
  score?: number;
}

/**
 * Search 组件属性
 */
export interface SearchProps {
  /** 搜索结果回调 */
  onResultClick?: (result: SearchResult) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * Pagefind 全局类型声明
 */
interface PagefindResult {
  id: string;
  data: () => Promise<{
    url: string;
    meta: { title: string };
    excerpt: string;
  }>;
}

interface PagefindInstance {
  init: () => Promise<void>;
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

declare global {
  interface Window {
    pagefind?: PagefindInstance;
  }
}

/**
 * Search 搜索组件
 */
export function Search({
  onResultClick,
  placeholder = '搜索文章...',
  showIcon = true,
  className = '',
}: SearchProps): ReactNode {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const pagefindInitialized = useRef(false);

  // 初始化 Pagefind
  useEffect(() => {
    const initPagefind = async () => {
      if (pagefindInitialized.current) return;

      try {
        // Pagefind 在构建后存在于 /pagefind/pagefind.js
        // @ts-expect-error - Pagefind 动态加载
        const pagefindModule = await import('/pagefind/pagefind.js');
        window.pagefind = pagefindModule;
        await pagefindModule.init?.();
        pagefindInitialized.current = true;
      } catch (error) {
        // Pagefind 未构建时静默失败
        console.debug('Pagefind not available:', error);
      }
    };

    initPagefind();
  }, []);

  // 执行搜索
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      if (!window.pagefind) {
        // 如果 Pagefind 未加载，使用备用搜索
        setResults([]);
        return;
      }

      const searchResult = await window.pagefind.search(searchQuery);

      const formattedResults: SearchResult[] = await Promise.all(
        searchResult.results.slice(0, 10).map(async (result) => {
          const data = await result.data();
          return {
            id: result.id,
            url: data.url,
            title: data.meta?.title || '无标题',
            excerpt: data.excerpt,
          };
        })
      );

      setResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // 处理结果点击
  const handleResultClick = useCallback((result: SearchResult) => {
    onResultClick?.(result);
    setQuery('');
    setResults([]);
    setIsFocused(false);
  }, [onResultClick]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        {showIcon && (
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary"
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
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={`
            w-full py-2 bg-bg-tertiary border border-border rounded-lg
            text-text-primary placeholder-text-tertiary
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
            transition-colors
            ${showIcon ? 'pl-10' : 'pl-3'} pr-3
          `}
          aria-label="搜索"
          aria-autocomplete="list"
          aria-controls="search-results"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="w-4 h-4 text-text-tertiary animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 搜索结果下拉 */}
      {isFocused && (query.trim() || results.length > 0) && (
        <div
          ref={resultsRef}
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-bg border border-border rounded-lg shadow-lg overflow-hidden z-50"
          role="listbox"
        >
          {results.length === 0 ? (
            query.trim() && !isLoading && (
              <div className="px-4 py-3 text-center text-text-tertiary text-sm">
                未找到相关结果
              </div>
            )
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-bg-tertiary transition-colors"
                    role="option"
                  >
                    <div className="font-medium text-text-primary truncate">
                      {result.title}
                    </div>
                    {result.excerpt && (
                      <div className="mt-1 text-sm text-text-tertiary line-clamp-2">
                        {result.excerpt}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;