import type { ReactNode } from 'react';

const KEYWORDS =
  'const|let|var|function|return|if|else|for|while|do|of|in|import|from|export|default|class|extends|new|typeof|instanceof|async|await|try|catch|finally|throw|switch|case|break|continue|yield|interface|type|enum|implements|private|public|static|readonly|def|lambda|pass|elif|and|or|not|None|True|False|null|undefined|true|false|this|super|self|void|then|await';

const TOKEN_RE = new RegExp(
  [
    '("(?:[^"\\\\]|\\\\.)*")',
    "('(?:[^'\\\\]|\\\\.)*')",
    '(`(?:[^`\\\\]|\\\\.)*`)',
    '(\\/\\/.*$)',
    '(#.*$)',
    '(\\b\\d+(?:\\.\\d+)?\\b)',
    `(\\b(?:${KEYWORDS})\\b)`,
  ].join('|'),
  'g',
);

const tokenColor = (token: string, groupIndex: number): string => {
  if (groupIndex === 1 || groupIndex === 2 || groupIndex === 3) return '#98c379';
  if (groupIndex === 4 || groupIndex === 5) return '#7f848e';
  if (groupIndex === 6) return '#d19a66';
  return '#c678dd';
};

export const highlightCode = (code: string, _language?: string): ReactNode[] => {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    const nodes: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    let key = 0;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(line))) {
      const before = line.slice(last, m.index);
      if (before) nodes.push(before);
      const group = m.slice(1).findIndex((g) => g !== undefined);
      nodes.push(
        <span key={key++} style={{ color: tokenColor(m[0], group) }}>
          {m[0]}
        </span>,
      );
      last = m.index + m[0].length;
    }
    const rest = line.slice(last);
    if (rest) nodes.push(rest);
    return <div key={i}>{nodes.length > 0 ? nodes : '\u00A0'}</div>;
  });
};

export const CODE_LANGUAGES = [
  'plain',
  'javascript',
  'typescript',
  'python',
  'html',
  'css',
  'json',
  'bash',
  'sql',
  'markdown',
] as const;
