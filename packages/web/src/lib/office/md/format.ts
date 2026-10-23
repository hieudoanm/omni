export interface SelectionEdit {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

export type FormatKind =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'inline-code'
  | 'code-block'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'task'
  | 'link'
  | 'image'
  | 'divider';

const lineStartOf = (text: string, pos: number): number =>
  text.lastIndexOf('\n', Math.max(0, pos - 1)) + 1;

export const wrapSelection = (
  text: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string,
): SelectionEdit => {
  const content = text.slice(start, end) || 'text';
  const inserted = `${prefix}${content}${suffix}`;
  return {
    text: `${text.slice(0, start)}${inserted}${text.slice(end)}`,
    selectionStart: start + prefix.length,
    selectionEnd: start + prefix.length + content.length,
  };
};

export const prefixLines = (
  text: string,
  start: number,
  end: number,
  prefix: string,
): SelectionEdit => {
  const lineStart = lineStartOf(text, start);
  const nextBreak = text.indexOf('\n', end);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const block = text.slice(lineStart, lineEnd);
  const prefixed = block
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n');
  const result = `${text.slice(0, lineStart)}${prefixed}${text.slice(lineEnd)}`;

  if (start === end) {
    const cursor = lineStart + prefixed.length;
    return { text: result, selectionStart: cursor, selectionEnd: cursor };
  }

  return {
    text: result,
    selectionStart: lineStart + prefix.length,
    selectionEnd: lineStart + prefixed.length,
  };
};

export const insertHeading = (text: string, pos: number, level: number): SelectionEdit => {
  const lineStart = lineStartOf(text, pos);
  const hashes = '#'.repeat(Math.min(6, Math.max(1, level)));
  const cursor = lineStart + hashes.length + 1;
  return {
    text: `${text.slice(0, lineStart)}${hashes} ${text.slice(lineStart)}`,
    selectionStart: cursor,
    selectionEnd: cursor,
  };
};

export const insertTable = (
  text: string,
  pos: number,
  rows: number,
  cols: number,
): SelectionEdit => {
  const row = (cells: string[]): string => `| ${cells.join(' | ')} |`;
  const header = row(Array.from({ length: cols }, () => 'Column'));
  const separator = row(Array.from({ length: cols }, () => '---'));
  const body = Array.from({ length: Math.max(0, rows - 1) }, () =>
    row(Array.from({ length: cols }, () => '')),
  ).join('\n');
  const table = [header, separator, body].filter(Boolean).join('\n');
  const insert = `\n\n${table}\n\n`;

  return {
    text: `${text.slice(0, pos)}${insert}${text.slice(pos)}`,
    selectionStart: pos,
    selectionEnd: pos,
  };
};

export const applyFormat = (
  text: string,
  start: number,
  end: number,
  kind: FormatKind,
): SelectionEdit => {
  switch (kind) {
    case 'bold':
      return wrapSelection(text, start, end, '**', '**');
    case 'italic':
      return wrapSelection(text, start, end, '*', '*');
    case 'strikethrough':
      return wrapSelection(text, start, end, '~~', '~~');
    case 'inline-code':
      return wrapSelection(text, start, end, '`', '`');
    case 'code-block':
      return wrapSelection(text, start, end, '```\n', '\n```');
    case 'quote':
      return prefixLines(text, start, end, '> ');
    case 'ul':
      return prefixLines(text, start, end, '- ');
    case 'ol':
      return prefixLines(text, start, end, '1. ');
    case 'task':
      return prefixLines(text, start, end, '- [ ] ');
    case 'link':
      return wrapSelection(text, start, end, '[', '](https://example.com)');
    case 'image':
      return wrapSelection(text, start, end, '![', '](https://example.com)');
    case 'divider': {
      const insert = `\n\n---\n\n`;
      return {
        text: `${text.slice(0, end)}${insert}${text.slice(end)}`,
        selectionStart: end,
        selectionEnd: end,
      };
    }
  }
};
