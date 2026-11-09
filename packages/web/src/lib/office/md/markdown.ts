import { Marked, Renderer, Token } from 'marked';
import DOMPurify from 'dompurify';
import { createSlugger } from '@/lib/office/md/slug';
import type { Stats, TocItem } from '@/lib/office/md/types';

const createMarked = (): Marked => {
  const slugger = createSlugger();

  return new Marked({
    gfm: true,
    renderer: {
      heading(this: Renderer, token: { tokens: Token[]; depth: number }): string {
        const text = this.parser.parseInline(token.tokens);
        const id = slugger.slug(text);
        return `<h${token.depth} id="${id}">${text}</h${token.depth}>`;
      },
    },
  });
};

export const renderMarkdown = async (content: string): Promise<string> => {
  const html = await createMarked().parse(content);
  return DOMPurify.sanitize(html);
};

export const extractToc = (content: string): TocItem[] => {
  const slugger = createSlugger();
  const items: TocItem[] = [];

  for (const line of content.split('\n')) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;
    const text = match[2].trim();
    items.push({
      id: slugger.slug(text),
      text,
      level: match[1].length,
    });
  }

  return items;
};

export const computeStats = (content: string): Stats => {
  const lines = content.split('\n');
  const headings = lines.filter((line) => /^#{1,6}\s/.test(line.trimStart())).length;
  const paragraphs = content.split(/\n\s*\n/).filter((part) => part.trim().length > 0).length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characters = content.replace(/\s/g, '').length;

  return { characters, words, paragraphs, headings };
};
