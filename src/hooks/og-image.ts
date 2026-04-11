/**
 * @fileoverview OG 图片生成钩子
 * @description 在构建时为每篇文章生成 OG 图片（SVG → PNG）
 * @description 使用 Satori + Resvg 在服务端渲染 OG 图片
 * @dependencies satori, @resvg/resvg-js（可选，未安装时返回占位图）
 * @example
 * import { generateOgImage } from '@hooks/og-image';
 * const png = await generateOgImage({ title: '文章标题', description: '描述' });
 */

export interface OgImageOptions {
  /** 文章/页面标题 */
  title: string;
  /** 页面描述 */
  description?: string;
  /** 标签列表 */
  tags?: string[];
  /** 作者名称 */
  author?: string;
  /** 背景色 */
  bg?: string;
  /** 主题色 */
  accent?: string;
}

/**
 * 生成 OG 图片的 PNG Buffer
 *
 * @param options - OG 图片配置选项
 * @returns PNG 图片的 Buffer
 *
 * @remarks
 * 此函数需要 satori 和 @resvg/resvg-js 依赖。
 * 如果依赖未安装，将返回默认的 OG 图片路径。
 */
export async function generateOgImage(options: OgImageOptions): Promise<Buffer> {
  const {
    title,
    description = '',
    tags = [],
    author = 'PixelVerse',
    accent = '#6366f1',
  } = options;

  // 尝试使用 satori + resvg 生成图片
  try {
    // @ts-expect-error satori is an optional dependency
    const satori = (await import('satori')).default;
    // @ts-expect-error @resvg/resvg-js is an optional dependency
    const { Resvg } = await import('@resvg/resvg-js');

    const svg = await satori(
      createOgImageJsx(title, description, tags, author, accent),
      {
        width: 1200,
        height: 630,
        fonts: await loadFonts(),
      }
    );

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
    });

    return resvg.render().asPng();
  } catch {
    // 如果依赖未安装，返回占位符
    return createFallbackOgImage();
  }
}

/**
 * 创建 OG 图片的 JSX 结构（satori 兼容）
 */
function createOgImageJsx(
  title: string,
  description: string,
  tags: string[],
  author: string,
  accent: string
) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: 1200,
        height: 630,
        backgroundColor: '#0f172a',
        padding: 60,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      children: [
        // 顶部装饰线
        {
          type: 'div',
          props: {
            style: {
              width: 120,
              height: 4,
              backgroundColor: accent,
              borderRadius: 2,
              marginBottom: 20,
            },
          },
        },
        // 品牌标识
        {
          type: 'div',
          props: {
            style: {
              fontSize: 24,
              fontWeight: 600,
              color: '#94a3b8',
              marginBottom: 60,
            },
            children: 'PixelVerse',
          },
        },
        // 标题
        {
          type: 'div',
          props: {
            style: {
              fontSize: title.length > 40 ? 42 : title.length > 25 ? 48 : 56,
              fontWeight: 700,
              color: '#f1f5f9',
              lineHeight: 1.3,
              marginBottom: description ? 20 : 40,
              maxWidth: 1040,
            },
            children: truncateText(title, 60),
          },
        },
        // 描述
        description
          ? {
              type: 'div',
              props: {
                style: {
                  fontSize: 22,
                  color: '#94a3b8',
                  lineHeight: 1.5,
                  marginBottom: 30,
                  maxWidth: 1040,
                },
                children: truncateText(description, 100),
              },
            }
          : null,
        // 标签
        tags.length > 0
          ? {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  gap: 12,
                  marginBottom: 40,
                },
                children: tags.slice(0, 4).map((tag) => ({
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 16px',
                      backgroundColor: `${accent}33`,
                      borderRadius: 16,
                      fontSize: 14,
                      color: '#a5b4fc',
                    },
                    children: tag,
                  },
                })),
              },
            }
          : null,
        // 底部信息
        {
          type: 'div',
          props: {
            style: {
              marginTop: 'auto',
              fontSize: 18,
              color: '#64748b',
            },
            children: `${author} · pixelverse.blog`,
          },
        },
      ].filter(Boolean),
    },
  };
}

/**
 * 加载字体文件
 */
async function loadFonts(): Promise<Array<{ name: string; data: Buffer; weight: number; style: string }>> {
  const fs = await import('fs');
  const path = await import('path');

  const fonts: Array<{ name: string; data: Buffer; weight: number; style: string }> = [];

  // 尝试加载系统字体
  const fontPaths = [
    '/System/Library/Fonts/PingFang.ttc',
    '/System/Library/Fonts/HelveticaNeue.ttc',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  ];

  for (const fontPath of fontPaths) {
    try {
      const fullPath = path.resolve(fontPath);
      const data = fs.readFileSync(fullPath);
      fonts.push({
        name: 'system-ui',
        data,
        weight: 400,
        style: 'normal',
      });
    } catch {
      // 字体文件不存在，跳过
    }
  }

  return fonts;
}

/**
 * 截断文本并添加省略号
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 创建默认的占位符 OG 图片
 */
function createFallbackOgImage(): Buffer {
  // 返回一个最小的 PNG 图片 Buffer
  // 实际使用时应返回预生成的默认图片
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
}

/**
 * 生成 OG 图片 URL
 *
 * @param slug - 文章 slug
 * @returns OG 图片的完整 URL
 */
export function getOgImageUrl(slug: string, siteUrl: string = 'https://pixelverse.blog'): string {
  return `${siteUrl}/images/og/${slug}.png`;
}
