import { describe, it, expect } from 'vitest';
import { isMarkdown } from '../../../src/lib/utils/isMarkdown';

describe('isMarkdown', () => {
  it('应检测标题语法', () => {
    expect(isMarkdown('# 标题')).toBe(true);
    expect(isMarkdown('## 二级标题')).toBe(true);
    expect(isMarkdown('###### 六级标题')).toBe(true);
  });

  it('应检测粗体和斜体', () => {
    expect(isMarkdown('**粗体文本**')).toBe(true);
    expect(isMarkdown('*斜体文本*')).toBe(true);
  });

  it('应检测列表', () => {
    expect(isMarkdown('- 列表项')).toBe(true);
    expect(isMarkdown('* 列表项')).toBe(true);
    expect(isMarkdown('+ 列表项')).toBe(true);
    expect(isMarkdown('1. 有序列表')).toBe(true);
  });

  it('应检测任务列表', () => {
    expect(isMarkdown('- [ ] 未完成任务')).toBe(true);
    expect(isMarkdown('- [x] 已完成任务')).toBe(true);
  });

  it('应检测引用', () => {
    expect(isMarkdown('> 这是一段引用')).toBe(true);
  });

  it('应检测代码块', () => {
    expect(isMarkdown('```\n代码块\n```')).toBe(true);
  });

  it('应检测行内代码', () => {
    expect(isMarkdown('这是 `行内代码`')).toBe(true);
  });

  it('应检测链接', () => {
    expect(isMarkdown('[链接文本](https://example.com)')).toBe(true);
  });

  it('应检测图片', () => {
    expect(isMarkdown('![图片描述](https://example.com/image.png)')).toBe(true);
  });

  it('应检测分割线', () => {
    expect(isMarkdown('---')).toBe(true);
    expect(isMarkdown('***')).toBe(true);
  });

  it('应检测表格', () => {
    expect(isMarkdown('| 列1 | 列2 |')).toBe(true);
  });

  it('纯文本不应被检测为 Markdown', () => {
    expect(isMarkdown('这是一段普通的纯文本')).toBe(false);
    expect(isMarkdown('Hello World')).toBe(false);
    expect(isMarkdown('')).toBe(false);
    expect(isMarkdown('   ')).toBe(false);
  });
});
