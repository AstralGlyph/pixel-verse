/**
 * @fileoverview 媒体服务
 * @description 上传文件到 public/uploads/、保存元信息到数据库、分页列表、删除文件和记录、MIME 类型和大小验证
 * @dependencies drizzle-orm, fs, path
 */

import { db, media, users } from '../db';
import { eq, desc, like, or } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { ApiError } from '../utils/errors';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.resolve('public/uploads');

// 确保上传目录存在
(async () => {
  try {
    await fsp.access(UPLOAD_DIR);
  } catch {
    await fsp.mkdir(UPLOAD_DIR, { recursive: true });
  }
})();

// 允许的 MIME 类型
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
  'audio/mpeg',
];

// 最大文件大小 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface UploadMediaInput {
  filename: string;
  mimeType: string;
  fileSize: number;
  buffer: Buffer;
  uploaderId: string;
  altText?: string;
}

/** 验证文件 */
function validateFile(mimeType: string, fileSize: number) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new ApiError('INVALID_MIME_TYPE', `不支持的文件类型: ${mimeType}`, 400);
  }
  if (fileSize > MAX_FILE_SIZE) {
    throw new ApiError('FILE_TOO_LARGE', `文件大小超过限制 (${MAX_FILE_SIZE / 1024 / 1024}MB)`, 400);
  }
}

/** 上传文件 */
export async function uploadMedia(input: UploadMediaInput) {
  validateFile(input.mimeType, input.fileSize);

  const id = randomUUID();
  const ext = path.extname(input.filename);
  const storedFilename = `${id}${ext}`;
  const storedPath = `uploads/${storedFilename}`;

  // 写入文件
  const fullPath = path.resolve(UPLOAD_DIR, storedFilename);
  fs.writeFileSync(fullPath, input.buffer);

  // 保存元信息
  await db.insert(media).values({
    id,
    filename: input.filename,
    storedPath,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    altText: input.altText,
    uploaderId: input.uploaderId,
  });

  return getMediaById(id);
}

/** 获取媒体列表（分页） */
export async function getMediaList(options: {
  page?: number;
  perPage?: number;
  search?: string;
}) {
  const { page = 1, perPage = 20, search } = options;

  // 构建 where 条件
  const conditions = [];
  if (search) {
    conditions.push(like(media.filename, `%${search}%`));
  }

  // 获取总数
  const totalResult = await db.select({ count: media.id }).from(media).where(conditions.length > 0 ? or(...conditions) : undefined);
  const total = totalResult.length;

  // 分页查询
  const result = await db.query.media.findMany({
    where: conditions.length > 0 ? or(...conditions) : undefined,
    with: {
      uploader: { columns: { id: true, username: true } },
    },
    orderBy: [desc(media.createdAt)],
    limit: perPage,
    offset: (page - 1) * perPage,
  });

  return {
    data: result,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

/** 获取媒体详情 */
export async function getMediaById(id: string) {
  return db.query.media.findFirst({
    where: eq(media.id, id),
    with: {
      uploader: { columns: { id: true, username: true } },
    },
  });
}

/** 删除媒体 */
export async function deleteMedia(id: string) {
  const item = await getMediaById(id);
  if (!item) {
    throw new ApiError('MEDIA_NOT_FOUND', '媒体文件不存在', 404);
  }

  // 删除文件
  const fullPath = path.resolve('public', item.storedPath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  // 删除数据库记录
  await db.delete(media).where(eq(media.id, id));
}

/** 更新媒体元信息 */
export async function updateMedia(id: string, data: { altText?: string }) {
  const item = await getMediaById(id);
  if (!item) {
    throw new ApiError('MEDIA_NOT_FOUND', '媒体文件不存在', 404);
  }

  const updates: Record<string, unknown> = {};
  if (data.altText !== undefined) updates.altText = data.altText;

  if (Object.keys(updates).length > 0) {
    // 动态更新（Drizzle SQLite 不支持部分更新）
    await db.update(media).set(updates).where(eq(media.id, id));
  }

  return getMediaById(id);
}
