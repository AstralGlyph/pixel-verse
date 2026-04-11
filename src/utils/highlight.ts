/**
 * @fileoverview 使用 Shiki 对 HTML 内容中的代码块进行语法高亮
 * @description 解析 TipTap 编辑器生成的 HTML，为其中的 <pre><code> 块添加 Shiki 语法高亮
 * @dependencies shiki
 */

import { createHighlighter, type Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * 获取单例 Shiki 高亮器
 */
async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark'],
      langs: [
        'javascript',
        'typescript',
        'jsx',
        'tsx',
        'python',
        'html',
        'css',
        'json',
        'bash',
        'shell',
        'sql',
        'rust',
        'go',
        'java',
        'c',
        'cpp',
        'csharp',
        'ruby',
        'swift',
        'kotlin',
        'dart',
        'php',
        'vue',
        'svelte',
        'markdown',
        'yaml',
        'toml',
        'xml',
        'diff',
        'docker',
        'graphql',
        'lua',
        'r',
        'scala',
        'zig',
        'powershell',
      ],
    });
  }
  return highlighterPromise;
}

/**
 * 从 TipTap 生成的 class 中提取语言标识
 * TipTap 使用 language-{lang} 或 language-{lang} 格式
 */
function extractLanguage(classAttr: string | undefined): string {
  if (!classAttr) return 'text';
  const match = classAttr.match(/language-(\S+)/);
  if (!match) return 'text';
  const lang = match[1];
  // 映射常见语言别名到 Shiki 支持的语言名
  const langMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    sh: 'bash',
    zsh: 'bash',
    cs: 'csharp',
    rb: 'ruby',
    yml: 'yaml',
    md: 'markdown',
  };
  return langMap[lang] || lang;
}

/**
 * 使用 Shiki 对 HTML 内容中的代码块进行语法高亮
 * @param content - TipTap 编辑器生成的 HTML 字符串
 * @returns 处理后的 HTML 字符串，代码块已添加语法高亮
 */
export async function highlightCode(content: string): Promise<string> {
  // 如果没有代码块，直接返回原始内容
  if (!content.includes('<pre')) return content;

  const highlighter = await getHighlighter();

  // 匹配 <pre> 块（包含嵌套的 <code>）
  const preRegex = /<pre(?:\s[^>]*)?>([\s\S]*?)<\/pre>/g;

  let result = content;
  const matches = [...content.matchAll(preRegex)];

  // 从后向前替换，保持位置正确
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const fullPre = match[0];
    const inner = match[1];

    // 从 <code> 标签提取 class 中的语言信息
    const codeMatch = inner.match(/<code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code>/);
    if (!codeMatch) continue;

    const lang = extractLanguage(codeMatch[1]);
    const code = codeMatch[2]
      // 去除 HTML 实体编码
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    try {
      const highlighted = highlighter.codeToHtml(code, {
        lang,
        theme: 'github-dark',
      });
      result = result.substring(0, match.index) + highlighted + result.substring(match.index! + fullPre.length);
    } catch {
      // 如果语言不支持，跳过此代码块
      continue;
    }
  }

  return result;
}
