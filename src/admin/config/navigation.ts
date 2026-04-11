/**
 * @fileoverview 管理后台导航菜单配置
 * @description 共享的导航项列表，供 Astro 侧边栏和 React 侧边栏组件使用
 */

import {
  LayoutDashboard,
  FileText,
  Tag,
  Tags,
  Image,
  FileStack,
  Users,
  ScrollText,
  Settings,
  FolderCode,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  dataPath: string;
}

export const navItems: NavItem[] = [
  { label: '仪表盘', href: '/admin/dashboard', icon: LayoutDashboard, dataPath: '/admin/dashboard' },
  { label: '文章管理', href: '/admin/posts', icon: FileText, dataPath: '/admin/posts' },
  { label: '分类管理', href: '/admin/categories', icon: Tag, dataPath: '/admin/categories' },
  { label: '标签管理', href: '/admin/tags', icon: Tags, dataPath: '/admin/tags' },
  { label: '媒体库', href: '/admin/media', icon: Image, dataPath: '/admin/media' },
  { label: '页面管理', href: '/admin/pages-admin', icon: FileStack, dataPath: '/admin/pages' },
  { label: '项目管理', href: '/admin/projects', icon: FolderCode, dataPath: '/admin/projects' },
  { label: '用户管理', href: '/admin/users', icon: Users, dataPath: '/admin/users' },
  { label: '审计日志', href: '/admin/audit-log', icon: ScrollText, dataPath: '/admin/audit-log' },
  { label: '设置', href: '/admin/settings', icon: Settings, dataPath: '/admin/settings' },
];
