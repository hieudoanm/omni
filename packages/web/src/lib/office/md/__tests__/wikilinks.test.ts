import {
  buildGraph,
  extractWikilinks,
  resolveNoteTitle,
  titleToId,
} from '@/lib/office/md/wikilinks';
import type { Note } from '@/lib/office/md/types';

describe('wikilinks', () => {
  describe('extractWikilinks', () => {
    it('returns linked note titles from a body', () => {
      const content = 'See [[About]] and [[Markdown Basics]] for details.';
      expect(extractWikilinks(content)).toEqual(['About', 'Markdown Basics']);
    });

    it('handles aliases with a pipe', () => {
      expect(extractWikilinks('Read [[About | the page]] now')).toEqual(['About']);
    });

    it('ignores text without wikilinks', () => {
      expect(extractWikilinks('Just plain text [a](b).')).toEqual([]);
    });
  });

  describe('titleToId', () => {
    it('slugifies a title', () => {
      expect(titleToId('Markdown Basics')).toBe('markdown-basics');
      expect(titleToId('  A  B  ')).toBe('a-b');
      expect(titleToId('')).toBe('');
    });
  });

  describe('resolveNoteTitle', () => {
    it('uses the first H1 heading', () => {
      expect(resolveNoteTitle('Intro text\n\n# My Title\n\nBody')).toBe('My Title');
    });

    it('falls back to the first non-empty line', () => {
      expect(resolveNoteTitle('Just a first line.')).toBe('Just a first line.');
    });

    it('returns Untitled for empty content', () => {
      expect(resolveNoteTitle('')).toBe('Untitled');
    });
  });

  describe('buildGraph', () => {
    const notes: Note[] = [
      {
        id: 'a',
        title: 'A',
        content: 'Links to [[B]] and [[missing]]',
        createdAt: 1,
        updatedAt: 1,
      },
      { id: 'b', title: 'B', content: 'No links', createdAt: 1, updatedAt: 1 },
    ];

    it('builds nodes for every note', () => {
      const graph = buildGraph(notes);
      expect(graph.nodes.map((node) => node.id)).toEqual(['a', 'b']);
    });

    it('links only to existing notes and counts dangling links', () => {
      const graph = buildGraph(notes);
      expect(graph.links).toEqual([{ source: 'a', target: 'b' }]);
      expect(graph.dangling).toBe(1);
    });
  });
});
