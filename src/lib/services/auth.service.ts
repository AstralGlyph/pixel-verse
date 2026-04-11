/**
 * @fileoverview 认证服务
 * @description 用户认证、密码哈希、登录验证
 * @dependencies bcryptjs, drizzle-orm
 */

import { db, users, roles } from '../db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { ApiError } from '../utils/errors';

const SALT_ROUNDS = 10;

/** 密码哈希 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** 验证密码 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** 用户登录 */
export async function login(username: string, password: string): Promise<{ user: { id: string; username: string; email: string; role: { id: string; name: string; display_name: string } } }> {
  // 查找用户
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    with: { role: true },
  });

  if (!user) {
    throw new ApiError('INVALID_CREDENTIALS', '用户名或密码错误', 401);
  }

  // 验证密码
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new ApiError('INVALID_CREDENTIALS', '用户名或密码错误', 401);
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name as 'super_admin' | 'editor' | 'author',
        display_name: user.role.displayName,
      },
    },
  };
}

/** 创建新用户 */
export async function createUser(username: string, password: string, email: string, roleId: string): Promise<{ id: string; username: string; email: string }> {
  // 检查用户名是否已存在
  const existing = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  if (existing) {
    throw new ApiError('USERNAME_EXISTS', '用户名已存在', 409);
  }

  // 检查邮箱是否已存在
  const existingEmail = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existingEmail) {
    throw new ApiError('EMAIL_EXISTS', '邮箱已被使用', 409);
  }

  const passwordHash = await hashPassword(password);
  const id = randomUUID();
  const now = new Date().toISOString();

  await db.insert(users).values({
    id,
    username,
    passwordHash,
    email,
    roleId,
    createdAt: now,
    updatedAt: now,
  });

  return { id, username, email };
}

/** 获取用户详情 */
export async function getUserById(userId: string): Promise<{ id: string; username: string; email: string; role: { id: string; name: string; display_name: string; permissions: string[] } } | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { role: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: {
      id: user.role.id,
      name: user.role.name,
      display_name: user.role.displayName,
      permissions: user.role.permissions as string[],
    },
  };
}

/** 用户自行修改密码 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new ApiError('USER_NOT_FOUND', '用户不存在', 404);
  }

  // 验证当前密码
  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError('INVALID_CURRENT_PASSWORD', '当前密码不正确', 401);
  }

  // 验证新密码长度
  if (newPassword.length < 6) {
    throw new ApiError('INVALID_PASSWORD', '新密码长度至少为 6 位', 400);
  }
  if (newPassword.length > 128) {
    throw new ApiError('INVALID_PASSWORD', '新密码长度不能超过 128 位', 400);
  }

  // 更新密码
  const passwordHash = await hashPassword(newPassword);
  const now = new Date().toISOString();
  await db.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.id, userId));
}
