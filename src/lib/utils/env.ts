/**
 * @fileoverview 环境变量配置验证
 * @description 使用 Zod 验证所有必需环境变量
 * @dependencies zod
 */

import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL 不能为空'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET 至少 32 个字符'),
  ADMIN_USERNAME: z.string().min(3, 'ADMIN_USERNAME 至少 3 个字符'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD 至少 8 个字符'),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL 格式不正确'),
});

export function validateEnv(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  });

  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`环境变量验证失败: ${errors}`);
  }

  return result.data;
}

export const env = validateEnv();
