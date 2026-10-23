import { type FC, type ReactNode } from 'react';

const H_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5'] as const;
const INLINE_RE = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

const List: FC<{ ordered: boolean; children: ReactNode }> = ({ ordered, children }) =>
  ordered ? (
    <ol className='my-1 list-decimal pl-4'>{children}</ol>
  ) : (
    <ul className='my-1 list-disc pl-4'>{children}</ul>
  );

const renderInline = (text: string, keyPrefix: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = INLINE_RE.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) nodes.push(<strong key={`${keyPrefix}-${k}`}>{m[1]}</strong>);
    else if (m[2]) nodes.push(<em key={`${keyPrefix}-${k}`}>{m[2]}</em>);
    else if (m[3]) nodes.push(<code key={`${keyPrefix}-${k}`}>{m[3]}</code>);
    else if (m[4] && m[5])
      nodes.push(
        <a key={`${keyPrefix}-${k}`} href={m[5]} target='_blank' rel='noreferrer'>
          {m[4]}
        </a>,
      );
    last = m.index + m[0].length;
    k++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
};

type Block =
  | { type: 'h'; level: number; text: string }
  | { type: 'p'; text: string }
  | { type: 'pre'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'hr' };

const parseBlocks = (text: string): Block[] => {
  const lines = text.split(/\r?\n/);
  const blocks: Block[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length > 0) {
      blocks.push({ type: 'p', text: para.join(' ') });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(
        list.ordered ? { type: 'ol', items: list.items } : { type: 'ul', items: list.items },
      );
      list = null;
    }
  };

  for (const raw of lines) {
    if (raw.trim().startsWith('```')) {
      if (!inCode) {
        flushPara();
        flushList();
        inCode = true;
        codeBuf = [];
      } else {
        blocks.push({ type: 'pre', text: codeBuf.join('\n') });
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(raw);
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(raw.trim());
    if (heading) {
      flushPara();
      flushList();
      blocks.push({ type: 'h', level: heading[1].length, text: heading[2] });
      continue;
    }
    if (/^\s*([-*_])\s*\1\s*\1\s*$/.test(raw)) {
      flushPara();
      flushList();
      blocks.push({ type: 'hr' });
      continue;
    }
    if (raw.trim().startsWith('> ')) {
      flushPara();
      flushList();
      blocks.push({ type: 'blockquote', text: raw.trim().slice(2) });
      continue;
    }
    const ul = /^\s*[-*+]\s+(.*)$/.exec(raw);
    const ol = /^\s*\d+\.\s+(.*)$/.exec(raw);
    if (ul || ol) {
      flushPara();
      const ordered = !ul;
      if (!list) list = { ordered, items: [] };
      list.items.push((ul ?? ol)![1]);
      continue;
    }
    if (raw.trim() === '') {
      flushPara();
      flushList();
      continue;
    }
    if (list && /^\s+/.test(raw)) {
      list.items[list.items.length - 1] += ' ' + raw.trim();
      continue;
    }
    flushList();
    para.push(raw.trim());
  }
  flushPara();
  flushList();
  if (inCode) blocks.push({ type: 'pre', text: codeBuf.join('\n') });
  return blocks;
};

export const renderMarkdown = (text: string): ReactNode => {
  const blocks = parseBlocks(text);
  return (
    <div className='markdown'>
      {blocks.map((b, i) => {
        if (b.type === 'h') {
          const Tag = H_TAGS[Math.min(b.level, 5) - 1];
          return (
            <Tag key={i} className='mb-1 font-semibold'>
              {renderInline(b.text, `h${i}`)}
            </Tag>
          );
        }
        if (b.type === 'pre')
          return (
            <pre key={i} className='bg-base-300 my-1 overflow-x-auto rounded-lg p-2 text-xs'>
              <code>{b.text}</code>
            </pre>
          );
        if (b.type === 'blockquote')
          return (
            <blockquote key={i} className='border-primary my-1 border-l-2 pl-2 text-sm opacity-80'>
              {renderInline(b.text, `q${i}`)}
            </blockquote>
          );
        if (b.type === 'hr') return <hr key={i} className='border-base-300 my-2' />;
        if (b.type === 'ul' || b.type === 'ol')
          return (
            <List key={i} ordered={b.type === 'ol'}>
              {b.items.map((item, j) => (
                <li key={j}>{renderInline(item, `l${i}-${j}`)}</li>
              ))}
            </List>
          );
        return (
          <p key={i} className='my-1 text-sm leading-relaxed'>
            {renderInline(b.text, `p${i}`)}
          </p>
        );
      })}
    </div>
  );
};
