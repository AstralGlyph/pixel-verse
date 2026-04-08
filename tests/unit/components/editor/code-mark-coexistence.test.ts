/**
 * @fileoverview Code mark 与其他 marks 共存的单元测试
 * @description 验证 code mark 可以与 bold、italic、underline、strike 同时应用
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Code from '@tiptap/extension-code';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

describe('Code mark coexistence', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [
        StarterKit.configure({
          code: false,
          underline: false,
        }),
        Code.extend({
          excludes: '',  // 允许 code 与其他 marks 共存
        }),
        Underline,
      ],
      content: '<p>测试文本</p>',
    });
  });

  it('应允许 code 和 bold 同时应用', () => {
    editor.chain().selectAll().toggleCode().run();
    editor.chain().toggleBold().run();

    const html = editor.getHTML();
    // code 和 bold 应该同时存在
    expect(html).toContain('<code>');
    expect(html).toContain('<strong>');
  });

  it('应允许 code 和 italic 同时应用', () => {
    editor.chain().selectAll().toggleCode().run();
    editor.chain().toggleItalic().run();

    const html = editor.getHTML();
    expect(html).toContain('<code>');
    expect(html).toContain('<em>');
  });

  it('应允许 code 和 underline 同时应用', () => {
    editor.chain().selectAll().toggleCode().run();
    editor.chain().toggleUnderline().run();

    const html = editor.getHTML();
    expect(html).toContain('<code>');
    expect(html).toContain('<u>');
  });

  it('应允许 code 和 strike 同时应用', () => {
    editor.chain().selectAll().toggleCode().run();
    editor.chain().toggleStrike().run();

    const html = editor.getHTML();
    expect(html).toContain('<code>');
    expect(html).toContain('<s>');
  });

  it('应允许 code 和 bold、italic 三者同时应用', () => {
    editor.chain().selectAll().toggleCode().run();
    editor.chain().toggleBold().run();
    editor.chain().toggleItalic().run();

    const html = editor.getHTML();
    expect(html).toContain('<code>');
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
  });

  it('应允许 code、bold、italic、strike 四者同时应用', () => {
    editor.chain().selectAll().toggleCode().run();
    editor.chain().toggleBold().run();
    editor.chain().toggleItalic().run();
    editor.chain().toggleStrike().run();

    const html = editor.getHTML();
    expect(html).toContain('<code>');
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
    expect(html).toContain('<s>');
  });

  it('code mark 切换后应正确清除', () => {
    editor.chain().selectAll().toggleCode().run();
    expect(editor.isActive('code')).toBe(true);

    editor.chain().toggleCode().run();
    expect(editor.isActive('code')).toBe(false);
  });
});
