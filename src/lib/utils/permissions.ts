/**
 * @fileoverview 权限守卫工具
 * @description 在 API 处理器执行前检查用户权限
 */

import { getUserById } from '../services/user.service';
import { ApiError } from './errors';

/** 角色权限定义 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['*'], // 所有权限
  editor: ['posts.create', 'posts.edit', 'posts.publish', 'posts.delete', 'categories.manage', 'tags.manage', 'media.manage', 'pages.manage'],
  author: ['posts.create', 'posts.edit', 'posts.publish', 'media.manage'],
};

/**
 * 检查用户是否有指定权限
 * @param userId 用户 ID
 * @param permission 权限名称（如 'posts.create'）
 * @throws 如果用户没有权限
 */
export async function requirePermission(userId: string, permission: string) {
  const user = await getUserById(userId);
  if (!user || !user.role) {
    throw new ApiError('UNAUTHORIZED', '用户不存在', 401);
  }

  const roleName = user.role.name;
  const permissions = ROLE_PERMISSIONS[roleName];

  if (!permissions) {
    throw new ApiError('FORBIDDEN', '未知角色，无权限', 403);
  }

  // super_admin 有所有权限
  if (permissions.includes('*')) return true;

  if (!permissions.includes(permission)) {
    throw new ApiError('FORBIDDEN', `权限不足: ${permission}`, 403);
  }

  return true;
}

/**
 * 检查用户是否为超级管理员
 */
export async function requireSuperAdmin(userId: string) {
  const user = await getUserById(userId);
  if (!user || !user.role || user.role.name !== 'super_admin') {
    throw new ApiError('FORBIDDEN', '仅超级管理员可执行此操作', 403);
  }
  return true;
}

/**
 * 检查用户是否为编辑者及以上
 */
export async function requireEditor(userId: string) {
  const user = await getUserById(userId);
  if (!user || !user.role) {
    throw new ApiError('UNAUTHORIZED', '用户不存在', 401);
  }
  const allowedRoles = ['super_admin', 'editor'];
  if (!allowedRoles.includes(user.role.name)) {
    throw new ApiError('FORBIDDEN', '编辑者及以上角色才可执行此操作', 403);
  }
  return true;
}
