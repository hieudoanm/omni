import { computeStats, extractToc, renderMarkdown } from '@/lib/office/md/markdown';

describe('markdown', () => {
  describe('renderMarkdown', () => {
    it('renders GFM markdown to sanitized html', async () => {
      const html = await renderMarkdown('# Hello\n\nSome **bold** text.');
      expect(html).toContain('<h1');
      expect(html).toContain('Hello');
      expect(html).toContain('<strong>bold</strong>');
    });

    it('adds stable ids to headings', async () => {
      const html = await renderMarkdown('# Hello World\n\n## Hello World');
      expect(html).toContain('id="hello-world"');
      expect(html).toContain('id="hello-world-2"');
    });

    it('strips unsafe html', async () => {
      const html = await renderMarkdown('<script>alert(1)</script>\n\n# Safe');
      expect(html).not.toContain('<script');
      expect(html).toContain('Safe');
    });
  });

  describe('extractToc', () => {
    it('collects headings in order with ids matching the renderer', async () => {
      const content = '# One\n\n## Two\n\n### Three\n\n# One\n\ntext';
      const toc = extractToc(content);
      expect(toc).toEqual([
        { id: 'one', text: 'One', level: 1 },
        { id: 'two', text: 'Two', level: 2 },
        { id: 'three', text: 'Three', level: 3 },
        { id: 'one-2', text: 'One', level: 1 },
      ]);
    });

    it('returns an empty array without headings', () => {
      expect(extractToc('plain text')).toEqual([]);
    });
  });

  describe('computeStats', () => {
    it('counts characters, words, paragraphs and headings', () => {
      const stats = computeStats('# Title\n\nTwo words here.\n\nMore.');
      expect(stats).toEqual({
        characters: 24,
        words: 6,
        paragraphs: 3,
        headings: 1,
      });
    });

    it('returns zeros for empty content', () => {
      expect(computeStats('')).toEqual({
        characters: 0,
        words: 0,
        paragraphs: 0,
        headings: 0,
      });
    });
  });
});
