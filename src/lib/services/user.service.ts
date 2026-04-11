/**
 * @fileoverview 用户服务
 * @description 用户 CRUD、密码重置、角色分配、用户列表、权限检查
 * @dependencies drizzle-orm
 */

import { db, users, roles } from '../db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { hashPassword } from './auth.service';
import { ApiError } from '../utils/errors';

export interface CreateUserInput {
  username: string;
  password: string;
  email: string;
  roleId: string;
}

export interface UpdateUserInput {
  id: string;
  username?: string;
  email?: string;
  roleId?: string;
}

/** 获取用户列表 */
export async function getUsers() {
  return db.query.users.findMany({
    with: {
      role: { columns: { id: true, name: true, displayName: true } },
    },
  });
}

/** 获取用户详情 */
export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      role: { columns: { id: true, name: true, displayName: true } },
    },
  });
}

/** 创建用户 */
export async function createUser(input: CreateUserInput) {
  // 检查用户名是否已存在
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, input.username),
  });
  if (existingUser) {
    throw new ApiError('USERNAME_EXISTS', '用户名已存在', 400);
  }

  // 检查邮箱是否已存在
  const existingEmail = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });
  if (existingEmail) {
    throw new ApiError('EMAIL_EXISTS', '邮箱已存在', 400);
  }

  // 检查角色是否存在
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, input.roleId),
  });
  if (!role) {
    throw new ApiError('ROLE_NOT_FOUND', '角色不存在', 400);
  }

  const id = randomUUID();
  const passwordHash = await hashPassword(input.password);
  const now = new Date().toISOString();

  await db.insert(users).values({
    id,
    username: input.username,
    passwordHash,
    email: input.email,
    roleId: input.roleId,
    createdAt: now,
    updatedAt: now,
  });

  return getUserById(id);
}

/** 更新用户 */
export async function updateUser(input: UpdateUserInput) {
  const existing = await getUserById(input.id);
  if (!existing) {
    throw new ApiError('USER_NOT_FOUND', '用户不存在', 404);
  }

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  if (input.username !== undefined) {
    if (input.username !== existing.username) {
      const dup = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });
      if (dup) throw new ApiError('USERNAME_EXISTS', '用户名已存在', 400);
    }
    updates.username = input.username;
  }

  if (input.email !== undefined) {
    if (input.email !== existing.email) {
      const dup = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });
      if (dup) throw new ApiError('EMAIL_EXISTS', '邮箱已存在', 400);
    }
    updates.email = input.email;
  }

  if (input.roleId !== undefined) {
    const role = await db.query.roles.findFirst({
      where: eq(roles.id, input.roleId),
    });
    if (!role) throw new ApiError('ROLE_NOT_FOUND', '角色不存在', 400);
    updates.roleId = input.roleId;
  }

  if (Object.keys(updates).length > 1) {
    await db.update(users).set(updates).where(eq(users.id, input.id));
  }

  return getUserById(input.id);
}

/** 重置密码 */
export async function resetPassword(userId: string, newPassword: string) {
  const existing = await getUserById(userId);
  if (!existing) {
    throw new ApiError('USER_NOT_FOUND', '用户不存在', 404);
  }

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date().toISOString() }).where(eq(users.id, userId));
}

/** 删除用户 */
export async function deleteUser(id: string) {
  const existing = await getUserById(id);
  if (!existing) {
    throw new ApiError('USER_NOT_FOUND', '用户不存在', 404);
  }

  await db.delete(users).where(eq(users.id, id));
}

/** 获取所有角色 */
export async function getRoles() {
  return db.query.roles.findMany({
    orderBy: (roles, { asc }) => [asc(roles.name)],
  });
}

/** 检查用户是否有指定角色 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user || !user.role) return false;
  return user.role.name === roleName;
}
