import type { ChartType } from '@/types/keynotes/deck';

export const CHART_TYPES: Array<{ id: ChartType; label: string }> = [
  { id: 'bar', label: 'Bar' },
  { id: 'column', label: 'Column' },
  { id: 'line', label: 'Line' },
  { id: 'area', label: 'Area' },
  { id: 'pie', label: 'Pie' },
  { id: 'doughnut', label: 'Doughnut' },
  { id: 'scatter', label: 'Scatter' },
];

export const CHART_PRESETS: Record<
  ChartType,
  { labels: string[]; data: number[][]; colors: string[] }
> = {
  bar: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    data: [[30, 45, 38, 52]],
    colors: ['#6366f1'],
  },
  column: {
    labels: ['A', 'B', 'C', 'D'],
    data: [[20, 34, 28, 46]],
    colors: ['#22d3ee'],
  },
  line: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [[12, 19, 15, 25, 22, 30]],
    colors: ['#f472b6'],
  },
  area: {
    labels: ['W1', 'W2', 'W3', 'W4'],
    data: [[8, 14, 11, 20]],
    colors: ['#34d399'],
  },
  pie: {
    labels: ['Red', 'Blue', 'Green', 'Yellow'],
    data: [[40, 25, 20, 15]],
    colors: ['#ef4444', '#3b82f6', '#22c55e', '#facc15'],
  },
  doughnut: {
    labels: ['One', 'Two', 'Three'],
    data: [[50, 30, 20]],
    colors: ['#8b5cf6', '#ec4899', '#f59e0b'],
  },
  scatter: {
    labels: ['x', 'y'],
    data: [
      [1, 2, 3, 4, 5, 6, 7, 8],
      [2, 4, 3, 6, 5, 8, 7, 9],
    ],
    colors: ['#6366f1'],
  },
};

export const DIAGRAM_TYPES = [
  { id: 'process', label: 'Process' },
  { id: 'cycle', label: 'Cycle' },
  { id: 'hierarchy', label: 'Hierarchy' },
  { id: 'matrix', label: 'Matrix' },
  { id: 'pyramid', label: 'Pyramid' },
] as const;
