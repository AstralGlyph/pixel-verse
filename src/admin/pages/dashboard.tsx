/**
 * @fileoverview 后台仪表盘页面
 * @description Bento Grid 统计卡片 + 最近操作列表 — Bento + Glassmorphism 风格
 */

import { useEffect, useState } from 'react';
import type { DashboardStats } from '../types';

// 颜色映射：用于卡片顶部渐变条和数值颜色
const colorMap: Record<string, { gradient: string; text: string; dot: string }> = {
  olive: {
    gradient: 'from-accent-primary/20 to-accent-primary/5',
    text: 'text-accent-primary',
    dot: 'bg-accent-primary',
  },
  terracotta: {
    gradient: 'from-accent-secondary/20 to-accent-secondary/5',
    text: 'text-accent-secondary',
    dot: 'bg-accent-secondary',
  },
  green: {
    gradient: 'from-success/20 to-success/5',
    text: 'text-success',
    dot: 'bg-success',
  },
  amber: {
    gradient: 'from-warning/20 to-warning/5',
    text: 'text-warning',
    dot: 'bg-warning',
  },
  info: {
    gradient: 'from-info/20 to-info/5',
    text: 'text-info',
    dot: 'bg-info',
  },
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/dashboard/stats');
        if (res.ok) {
          const json = await res.json();
          setStats(json.data);
        }
      } catch {
        // 忽略错误
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: '总文章', value: stats?.totalPosts ?? 0, color: 'olive', span: 'col-span-2' },
    { label: '已发布', value: stats?.publishedPosts ?? 0, color: 'green', span: '' },
    { label: '草稿', value: stats?.draftPosts ?? 0, color: 'amber', span: '' },
    { label: '分类', value: stats?.totalCategories ?? 0, color: 'terracotta', span: '' },
    { label: '标签', value: stats?.totalTags ?? 0, color: 'info', span: '' },
    { label: '媒体文件', value: stats?.totalMedia ?? 0, color: 'olive', span: '' },
  ];

  return (
    <div className="space-y-6 page-content">
      {isLoading ? (
        <div className="flex items-center justify-center p-8">加载中...</div>
      ) : (
        <>
          {/* Bento Grid 统计卡片 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-7">
            {statCards.map((stat) => {
              const colors = colorMap[stat.color];
              return (
                <div
                  key={stat.label}
                  className={`glass-card group relative overflow-hidden rounded-xl p-6 spring-hover ${stat.span}`}
                >
                  {/* 顶部渐变条 */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                    <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
                  </div>
                  <p className={`mt-3 text-4xl font-bold ${colors.text}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* 最近操作 — 全宽玻璃卡片 */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">最近操作</h3>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <ul className="divide-y divide-glass-border">
                {stats.recentActivity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-3 transition-colors duration-fast hover:bg-glass-bg-hover rounded-md px-2 -mx-2"
                  >
                    <div>
                      <span className="text-sm font-medium text-text-primary">{item.action}</span>
                      <span className="ml-2 text-sm text-text-tertiary">
                        {item.target_type}: {item.target_id}
                      </span>
                    </div>
                    <span className="text-xs text-text-tertiary/60">
                      {new Date(item.created_at).toLocaleString('zh-CN')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-tertiary">暂无操作记录</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
