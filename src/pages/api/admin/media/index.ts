/**
 * @fileoverview 媒体管理 API 路由
 * @description 上传 POST、列表 GET、删除 DELETE
 */

import type { APIRoute } from 'astro';
import { uploadMedia, getMediaList, deleteMedia } from '../../../../lib/services/media.service';
import { ok, error, getUserId } from '../../../../api/index';
import { ApiError } from '../../../../lib/utils/errors';

/** GET /api/admin/media - 媒体列表 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    getUserId({ locals });
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '20'), 50);
    const search = url.searchParams.get('search') || undefined;

    const result = await getMediaList({ page, perPage, search });
    return ok(result);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('获取媒体列表失败'));
  }
};

/** POST /api/admin/media - 上传文件 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const userId = getUserId({ locals });
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return error(new ApiError('VALIDATION_ERROR', '请选择要上传的文件', 400));
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const altText = (formData.get('alt_text') as string) || undefined;

    const media = await uploadMedia({
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      buffer,
      uploaderId: userId,
      altText,
    });

    return ok(media);
  } catch (err) {
    return error(err instanceof Error ? err : new Error('上传文件失败'));
  }
};

/** DELETE /api/admin/media/:id - 删除媒体 */
export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    getUserId({ locals });
    const id = params.id;
    if (!id) return error(new ApiError('VALIDATION_ERROR', '媒体 ID 不能为空', 400));

    await deleteMedia(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return error(err instanceof Error ? err : new Error('删除媒体失败'));
  }
};
