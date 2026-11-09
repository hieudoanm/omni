export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export type ViewMode = 'editor' | 'split' | 'preview';

export interface Stats {
  characters: number;
  words: number;
  paragraphs: number;
  headings: number;
}

export interface GraphNode {
  id: string;
  label: string;
  group: number;
  size: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  dangling: number;
}

export interface GraphStats {
  notes: number;
  links: number;
  dangling: number;
}

export interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
}
