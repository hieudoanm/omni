import type { GraphData, GraphLink, GraphNode, Note } from '@/lib/office/md/types';

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;

export const extractWikilinks = (content: string): string[] =>
  Array.from(content.matchAll(WIKILINK_RE), (m) => m[1].trim());

export const titleToId = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const resolveNoteTitle = (content: string): string => {
  const heading = content.match(/^\s*#\s+(.+)$/m);
  if (heading) return heading[1].trim();

  const firstLine = content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  return firstLine ? firstLine.slice(0, 48) : 'Untitled';
};

const buildNode = (note: Note, index: number): GraphNode => ({
  id: note.id,
  label: note.title,
  group: 0,
  size: Math.max(3, Math.min(10, 4 + index / 2)),
});

export const buildGraph = (notes: Note[]): GraphData => {
  const byId = new Map(notes.map((note) => [note.id, note]));
  const links: GraphLink[] = [];
  let dangling = 0;

  for (const note of notes) {
    for (const link of extractWikilinks(note.content)) {
      const targetId = titleToId(link);
      if (byId.has(targetId)) {
        links.push({ source: note.id, target: targetId });
      } else {
        dangling += 1;
      }
    }
  }

  return {
    nodes: notes.map(buildNode),
    links,
    dangling,
  };
};
