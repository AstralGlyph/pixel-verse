/**
 * @fileoverview Markdown 语法检测工具
 * @description 检测纯文本是否包含 Markdown 语法，用于粘贴时的自动转换判断
 */

/**
 * 检测文本是否包含 Markdown 语法
 * @param text - 待检测的文本
 * @returns 是否包含 Markdown 语法
 */
export function isMarkdown(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  const patterns = [
    /^#{1,6}\s+/m,           // 标题: # 标题
    /^\s*[-*+]\s+/m,         // 无序列表: - 项
    /^\s*\d+\.\s+/m,         // 有序列表: 1. 项
    /^\s*[-*+]\s*\[[ x]\]/m, // 任务列表: - [ ] 任务
    /^>\s+/m,                // 引用: > 引用
    /^```/m,                 // 代码块: ```
    /^---$|^\*\*\*$|^___$/m, // 分割线: --- 或 ***
    /\*\*[^*]+\*\*/,         // 粗体: **文本**
    /(?<!\*)\*(?!\*)(?!\s)\S[^*]*\S\*(?!\*)/, // 斜体: *文本*
    /`[^`]+`/,               // 行内代码: `代码`
    /\[[^\]]+\]\([^)]+\)/,   // 链接: [文本](url)
    /!\[[^\]]*\]\([^)]+\)/,  // 图片: ![alt](url)
    /^\|[^|]+\|/m,           // 表格: | 列 | 列 |
  ];

  return patterns.some((pattern) => pattern.test(text));
}
