/**
 * @fileoverview Giscus 评论组件
 * @description 集成 Giscus 评论系统，基于 GitHub Discussions
 * @example
 * <GiscusComments
 *   repo="username/repo"
 *   repoId="your-repo-id"
 *   category="Comments"
 *   categoryId="your-category-id"
 * />
 */

import { useEffect, useRef, type ReactNode } from 'react';

export interface GiscusConfig {
  /** GitHub 仓库，格式：owner/repo */
  repo: string;
  /** 仓库 ID */
  repoId: string;
  /** 评论分类名称 */
  category?: string;
  /** 分类 ID */
  categoryId: string;
  /** 映射方式：pathname, url, title, og:title, specific, number */
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  /** 严格模式 */
  strict?: '0' | '1';
  /** 反应启用 */
  reactionsEnabled?: '0' | '1';
  /** 元数据发送 */
  emitMetadata?: '0' | '1';
  /** 输入位置 */
  inputPosition?: 'top' | 'bottom';
  /** 主题 */
  theme?: string;
  /** 语言 */
  lang?: string;
  /** 懒加载 */
  loading?: 'lazy' | 'eager';
}

export interface GiscusCommentsProps {
  /** Giscus 配置 */
  config: GiscusConfig;
}

const defaultConfig: Partial<GiscusConfig> = {
  category: 'Comments',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'bottom',
  lang: 'zh-CN',
  loading: 'lazy',
};

/**
 * GiscusComments Giscus 评论组件
 */
export function GiscusComments({ config }: GiscusCommentsProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const mergedConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    if (!containerRef.current) return;

    // 清空容器
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    // 设置 Giscus 属性
    const attrs: Record<string, string> = {
      'data-repo': mergedConfig.repo || '',
      'data-repo-id': mergedConfig.repoId || '',
      'data-category': mergedConfig.category || 'Comments',
      'data-category-id': mergedConfig.categoryId || '',
      'data-mapping': mergedConfig.mapping || 'pathname',
      'data-strict': mergedConfig.strict || '0',
      'data-reactions-enabled': mergedConfig.reactionsEnabled || '1',
      'data-emit-metadata': mergedConfig.emitMetadata || '0',
      'data-input-position': mergedConfig.inputPosition || 'bottom',
      'data-theme': mergedConfig.theme || 'preferred_color_scheme',
      'data-lang': mergedConfig.lang || 'zh-CN',
    };

    if (mergedConfig.loading) {
      attrs['data-loading'] = mergedConfig.loading;
    }

    Object.entries(attrs).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [mergedConfig]);

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-text-primary mb-6">评论</h2>
      <div ref={containerRef} aria-label="评论区" />
    </div>
  );
}

export default GiscusComments;
