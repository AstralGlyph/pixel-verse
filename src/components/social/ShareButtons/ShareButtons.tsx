/**
 * @fileoverview 分享按钮组件
 * @description 支持分享到 Twitter/X、LinkedIn、复制链接等功能
 * @description 支持选中文字分享功能
 * @example
 * <ShareButtons
 *   url="https://example.com/blog/post"
 *   title="文章标题"
 *   description="文章描述"
 * />
 */

import { useState, useCallback, type ReactNode } from 'react';

export interface ShareButtonsProps {
  /** 分享链接 */
  url: string;
  /** 分享标题 */
  title: string;
  /** 分享描述 */
  description?: string;
  /** 额外样式类名 */
  className?: string;
}

interface SharePlatform {
  name: string;
  icon: ReactNode;
  getUrl: (url: string, title: string) => string;
}

const platforms: SharePlatform[] = [
  {
    name: 'Twitter/X',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'LinkedIn',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    getUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

/**
 * ShareButtons 分享按钮组件
 */
export function ShareButtons({
  url,
  title,
  className = '',
}: ShareButtonsProps): ReactNode {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const openShare = useCallback((platformUrl: string) => {
    window.open(platformUrl, '_blank', 'width=600,height=400');
  }, []);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm text-text-tertiary">分享到：</span>

      {/* 社交平台 */}
      {platforms.map((platform) => (
        <button
          key={platform.name}
          type="button"
          onClick={() => openShare(platform.getUrl(url, title))}
          className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          aria-label={`分享到 ${platform.name}`}
          title={`分享到 ${platform.name}`}
        >
          {platform.icon}
        </button>
      ))}

      {/* 复制链接 */}
      <button
        type="button"
        onClick={copyLink}
        className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        aria-label={copied ? '已复制链接' : '复制链接'}
        title={copied ? '已复制！' : '复制链接'}
      >
        {copied ? (
          <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default ShareButtons;
