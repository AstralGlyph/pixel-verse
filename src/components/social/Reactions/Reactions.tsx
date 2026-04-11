/**
 * @fileoverview 文章反应组件
 * @description 允许读者对文章进行表情反应，类似 GitHub Reactions
 * @description 反应数据存储在 localStorage 中（无后端时）
 * @example
 * <Reactions slug="welcome-to-pixelverse" />
 */

import { useState, useCallback, type ReactNode } from 'react';

export interface ReactionType {
  emoji: string;
  label: string;
  count: number;
}

export interface ReactionsProps {
  /** 文章 slug */
  slug: string;
  /** 可用的反应类型 */
  availableReactions?: Array<{ emoji: string; label: string }>;
}

const STORAGE_PREFIX = 'reactions-';

const defaultReactions = [
  { emoji: '👍', label: '赞' },
  { emoji: '❤️', label: '喜欢' },
  { emoji: '🎉', label: '有趣' },
  { emoji: '🚀', label: '实用' },
  { emoji: '💡', label: '启发' },
  { emoji: '👀', label: '关注' },
];

/**
 * 获取某篇文章的反应数据
 */
function getReactions(slug: string, available: Array<{ emoji: string; label: string }>): ReactionType[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return available.map((r) => ({
        ...r,
        count: parsed[r.emoji] || 0,
      }));
    }
  } catch {
    // 忽略解析错误
  }

  return available.map((r) => ({ ...r, count: 0 }));
}

/**
 * 保存反应数据
 */
function saveReaction(slug: string, emoji: string) {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
    const data = stored ? JSON.parse(stored) : {};
    data[emoji] = (data[emoji] || 0) + 1;
    localStorage.setItem(`${STORAGE_PREFIX}${slug}`, JSON.stringify(data));
  } catch {
    // 忽略存储错误
  }
}

/**
 * Reactions 文章反应组件
 */
export function Reactions({
  slug,
  availableReactions = defaultReactions,
}: ReactionsProps): ReactNode {
  const [reactions, setReactions] = useState<ReactionType[]>(() =>
    getReactions(slug, availableReactions)
  );
  const [reacted, setReacted] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${slug}-user`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleReaction = useCallback(
    (emoji: string) => {
      if (reacted.has(emoji)) return;

      saveReaction(slug, emoji);
      setReacted((prev) => {
        const next = new Set(prev);
        next.add(emoji);
        localStorage.setItem(
          `${STORAGE_PREFIX}${slug}-user`,
          JSON.stringify([...next])
        );
        return next;
      });
      setReactions((prev) =>
        prev.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1 } : r
        )
      );
    },
    [slug, reacted]
  );

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="文章反应">
      {reactions.map((reaction) => {
        const hasReacted = reacted.has(reaction.emoji);

        return (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => handleReaction(reaction.emoji)}
            disabled={hasReacted}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-150
              ${
                hasReacted
                  ? 'bg-accent/10 border-2 border-accent text-accent'
                  : 'bg-bg-tertiary border-2 border-transparent hover:border-border text-text-secondary'
              }
              ${hasReacted ? 'cursor-default' : 'cursor-pointer'}
            `}
            aria-label={`${reaction.label} (${reaction.count})`}
            aria-pressed={hasReacted}
            title={reaction.label}
          >
            <span aria-hidden="true">{reaction.emoji}</span>
            <span className="font-medium">{reaction.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default Reactions;
