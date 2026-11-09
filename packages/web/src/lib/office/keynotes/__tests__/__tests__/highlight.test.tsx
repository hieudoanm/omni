import { render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { highlightCode } from '@/lib/office/keynotes/highlight';

const text = (nodes: ReactNode[]) =>
  nodes
    .map((n) => {
      if (typeof n !== 'object' || n === null || !('props' in n)) return '';
      const props = (n as { props: { children: ReactNode[] } }).props;
      return props.children.filter((c): c is string => typeof c === 'string').join('');
    })
    .join('');

describe('highlightCode', () => {
  it('preserves plain text without tokens', () => {
    const nodes = highlightCode('hello world', 'plain');
    expect(nodes).toHaveLength(1);
    expect(text(nodes)).toBe('hello world');
  });

  it('splits each line into its own div', () => {
    const nodes = highlightCode('a\nb', 'plain');
    expect(nodes).toHaveLength(2);
  });

  it('keeps blank lines rendered', () => {
    const nodes = highlightCode('a\n\nb', 'plain');
    expect(nodes).toHaveLength(3);
  });

  it('highlights strings, numbers, keywords and comments with colored spans', () => {
    const nodes = highlightCode('const x = 42 + "hi"; // note', 'javascript');
    const line = nodes[0] as ReactElement<{ children: ReactNode[] }>;
    const spans = line.props.children.filter((c) => c !== null && typeof c === 'object');
    expect(spans.length).toBeGreaterThan(3);
  });
});
