import {
  applyFormat,
  insertHeading,
  insertTable,
  prefixLines,
  wrapSelection,
} from '@/lib/office/md/format';

describe('format', () => {
  describe('wrapSelection', () => {
    it('wraps the selected text', () => {
      expect(wrapSelection('hello world', 6, 11, '**', '**')).toEqual({
        text: 'hello **world**',
        selectionStart: 8,
        selectionEnd: 13,
      });
    });

    it('inserts a placeholder for an empty selection', () => {
      expect(wrapSelection('ab', 1, 1, '**', '**')).toEqual({
        text: 'a**text**b',
        selectionStart: 3,
        selectionEnd: 7,
      });
    });
  });

  describe('prefixLines', () => {
    it('prefixes every line in the selection range', () => {
      expect(prefixLines('one\ntwo\nthree', 0, 7, '- ')).toEqual({
        text: '- one\n- two\nthree',
        selectionStart: 2,
        selectionEnd: 11,
      });
    });

    it('prefixes the current line for a collapsed selection', () => {
      expect(prefixLines('one\ntwo', 4, 4, '> ')).toEqual({
        text: 'one\n> two',
        selectionStart: 9,
        selectionEnd: 9,
      });
    });
  });

  describe('insertHeading', () => {
    it('inserts a heading at the start of the line', () => {
      expect(insertHeading('line', 2, 2)).toEqual({
        text: '## line',
        selectionStart: 3,
        selectionEnd: 3,
      });
    });
  });

  describe('insertTable', () => {
    it('builds a table with header, separator and body rows', () => {
      const edit = insertTable('text', 4, 2, 2);
      expect(edit.text).toContain('| Column | Column |');
      expect(edit.text).toContain('| --- | --- |');
      expect(edit.text).toContain('|  |  |');
    });
  });

  describe('applyFormat', () => {
    it('applies bold, italic, inline code and dividers', () => {
      expect(applyFormat('word', 0, 4, 'bold')).toEqual({
        text: '**word**',
        selectionStart: 2,
        selectionEnd: 6,
      });
      expect(applyFormat('word', 0, 4, 'italic')).toEqual({
        text: '*word*',
        selectionStart: 1,
        selectionEnd: 5,
      });
      expect(applyFormat('word', 0, 4, 'strikethrough')).toEqual({
        text: '~~word~~',
        selectionStart: 2,
        selectionEnd: 6,
      });
      expect(applyFormat('word', 0, 4, 'inline-code')).toEqual({
        text: '`word`',
        selectionStart: 1,
        selectionEnd: 5,
      });
      expect(applyFormat('word', 0, 4, 'code-block')).toEqual({
        text: '```\nword\n```',
        selectionStart: 4,
        selectionEnd: 8,
      });
      expect(applyFormat('word', 4, 4, 'divider')).toEqual({
        text: 'word\n\n---\n\n',
        selectionStart: 4,
        selectionEnd: 4,
      });
    });

    it('builds task, bullet and quote prefixes', () => {
      expect(applyFormat('do this', 0, 7, 'task').text).toBe('- [ ] do this');
      expect(applyFormat('do this', 0, 7, 'ul').text).toBe('- do this');
      expect(applyFormat('do this', 0, 7, 'ol').text).toBe('1. do this');
      expect(applyFormat('do this', 0, 7, 'quote').text).toBe('> do this');
    });

    it('creates link and image syntax from a selection', () => {
      expect(applyFormat('docs', 0, 4, 'link').text).toBe('[docs](https://example.com)');
      expect(applyFormat('pic', 0, 3, 'image').text).toBe('![pic](https://example.com)');
    });
  });
});
