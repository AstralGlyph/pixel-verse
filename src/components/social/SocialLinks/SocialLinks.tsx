/**
 * @fileoverview SocialLinks 社交链接组件
 * @description 展示作者的社交媒体和联系信息
 */

import { type ReactNode } from 'react';

/**
 * 社交链接项
 */
export interface SocialLinkItem {
  /** 平台名称 */
  name: string;
  /** 链接地址 */
  url: string;
  /** 图标（emoji 或 SVG 字符串） */
  icon: string;
  /** 用户名/显示名 */
  username?: string;
}

/**
 * SocialLinks 组件属性
 */
export interface SocialLinksProps {
  /** 社交链接列表 */
  links: SocialLinkItem[];
  /** 布局方向 */
  direction?: 'horizontal' | 'vertical';
  /** 是否显示用户名 */
  showUsername?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 图标映射
 */
const iconMap: Record<string, string> = {
  github: '🐙',
  twitter: '🐦',
  x: '𝕏',
  linkedin: '💼',
  email: '📧',
  rss: '📡',
  youtube: '📺',
  dribbble: '🏀',
  codepen: '✏️',
  medium: '📝',
  zhihu: '💡',
  weibo: '🌊',
  bilibili: '📺',
  juejin: '🪙',
};

/**
 * SocialLinks 社交链接组件
 */
export function SocialLinks({
  links,
  direction = 'horizontal',
  showUsername = false,
}: SocialLinksProps): ReactNode {
  if (links.length === 0) {
    return null;
  }

  const directionClass = direction === 'vertical'
    ? 'flex flex-col gap-3'
    : 'flex flex-wrap gap-3';

  return (
    <div className={directionClass}>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link-item flex items-center gap-2 px-3 py-2 bg-bg-tertiary rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors text-text-secondary hover:text-text-primary"
          aria-label={`${link.name}${link.username ? `: ${link.username}` : ''}`}
        >
          {/* 图标 */}
          <span className="text-lg" role="img" aria-hidden="true">
            {iconMap[link.name.toLowerCase()] || link.icon || '🔗'}
          </span>

          {/* 用户名 */}
          {showUsername && link.username && (
            <span className="text-sm">{link.username}</span>
          )}

          {/* 平台名称（屏幕阅读器） */}
          <span className="sr-only">{link.name}</span>
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;