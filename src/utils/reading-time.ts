/**
 * 阅读时间计算工具
 * @module utils/reading-time
 */

/**
 * 阅读时间配置
 */
interface ReadingTimeOptions {
  /** 每分钟阅读字数（中文） */
  wordsPerMinuteCN: number;
  /** 每分钟阅读单词数（英文） */
  wordsPerMinuteEN: number;
}

const DEFAULT_OPTIONS: ReadingTimeOptions = {
  wordsPerMinuteCN: 300, // 中文平均阅读速度
  wordsPerMinuteEN: 200, // 英文平均阅读速度
};

/**
 * 计算阅读时间
 * @param content - 文章内容
 * @param options - 配置选项
 * @returns 阅读时间（分钟）
 */
export function calculateReadingTime(
  content: string,
  options: Partial<ReadingTimeOptions> = {}
): number {
  const { wordsPerMinuteCN, wordsPerMinuteEN } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // 移除 Markdown 语法标记
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`]*`/g, '') // 移除行内代码
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 移除链接，保留文本
    .replace(/[#*_~>|-]/g, '') // 移除 Markdown 标记
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 移除图片
    .replace(/\$\$[\s\S]*?\$\$/g, '') // 移除 LaTeX 公式块
    .replace(/\$[^$]*\$/g, '') // 移除行内 LaTeX
    .replace(/<[^>]*>/g, '') // 移除 HTML 标签
    .trim();

  // 统计中文字符数
  const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;

  // 统计英文单词数
  const englishWords = plainText
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // 计算阅读时间
  const readingTimeCN = chineseChars / wordsPerMinuteCN;
  const readingTimeEN = englishWords / wordsPerMinuteEN;

  // 向上取整，最少 1 分钟
  return Math.max(1, Math.ceil(readingTimeCN + readingTimeEN));
}

/**
 * 格式化阅读时间显示
 * @param minutes - 阅读时间（分钟）
 * @returns 格式化后的阅读时间字符串
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return '1 分钟阅读';
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} 小时 ${mins} 分钟阅读` : `${hours} 小时阅读`;
  }
  return `${minutes} 分钟阅读`;
}

/**
 * 获取文章阅读时间信息
 * @param content - 文章内容
 * @param manualTime - 手动指定的阅读时间（可选）
 * @returns 阅读时间信息对象
 */
export function getReadingTimeInfo(
  content: string,
  manualTime?: number | 'auto'
): { minutes: number; display: string } {
  if (typeof manualTime === 'number' && manualTime > 0) {
    return {
      minutes: manualTime,
      display: formatReadingTime(manualTime),
    };
  }
  const minutes = calculateReadingTime(content);
  return {
    minutes,
    display: formatReadingTime(minutes),
  };
}