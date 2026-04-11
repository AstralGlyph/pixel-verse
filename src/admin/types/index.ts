/**
 * @fileoverview 共享 TypeScript 类型定义
 * @description Admin CMS 中使用的所有类型
 */

/** 角色 */
export interface Role {
  id: string;
  name: 'super_admin' | 'editor' | 'author';
  display_name: string;
  permissions: string[];
  created_at: string;
}

/** 用户 */
export interface User {
  id: string;
  username: string;
  email: string;
  role_id: string;
  role?: Role;
  created_at: string;
  updated_at: string;
}

/** 文章状态 */
export type PostStatus = 'draft' | 'published' | 'archived';

/** 文章 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image_id?: string;
  status: PostStatus;
  author_id: string;
  author?: { id: string; username: string };
  category_id?: string;
  category?: { id: string; name: string };
  tags?: { id: string; name: string }[];
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

/** 分类 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  post_count?: number;
  created_at: string;
}

/** 标签 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  post_count?: number;
  created_at: string;
}

/** 媒体文件 */
export interface Media {
  id: string;
  filename: string;
  stored_path: string;
  mime_type: string;
  file_size: number;
  alt_text?: string;
  uploader_id: string;
  created_at: string;
}

/** 页面 */
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

/** API 响应 */
export interface ApiResponse<T> {
  data: T;
  error?: {
    code: string;
    message: string;
    fields?: string[];
  };
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/** 仪表盘统计 */
export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalTags: number;
  totalMedia: number;
  totalPages: number;
  recentActivity: ActivityItem[];
}

/** 活动记录 */
export interface ActivityItem {
  id: string;
  action: string;
  target_type: string;
  target_id?: string;
  user: { username: string };
  created_at: string;
}
