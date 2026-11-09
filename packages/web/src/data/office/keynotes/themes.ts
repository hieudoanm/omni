import type { DeckTheme, FontFamily } from '@/types/keynotes/deck';

export const THEMES: DeckTheme[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      primary: '#6366f1',
      secondary: '#22d3ee',
      accent: '#f472b6',
      background: '#0b1020',
      surface: '#131a33',
      text: '#e5e9ff',
      muted: '#8a93c0',
    },
    fontFamily: 'space-grotesk',
    fontSize: 18,
    variants: [
      {
        id: 'classic',
        name: 'Classic',
        background: '#0b1020',
        surface: '#131a33',
      },
      {
        id: 'indigo',
        name: 'Indigo',
        background: '#111030',
        surface: '#1c1a4d',
        text: '#eceaff',
      },
      {
        id: 'teal',
        name: 'Teal',
        background: '#062022',
        surface: '#0d3033',
        text: '#e0fffb',
      },
    ],
  },
  {
    id: 'slate',
    name: 'Slate',
    colors: {
      primary: '#3b82f6',
      secondary: '#94a3b8',
      accent: '#f59e0b',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      muted: '#94a3b8',
    },
    fontFamily: 'sans',
    fontSize: 18,
    variants: [
      {
        id: 'classic',
        name: 'Classic',
        background: '#0f172a',
        surface: '#1e293b',
      },
      { id: 'cool', name: 'Cool', background: '#0b1226', surface: '#17203d' },
    ],
  },
  {
    id: 'paper',
    name: 'Paper',
    colors: {
      primary: '#0f766e',
      secondary: '#0284c7',
      accent: '#ea580c',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
    },
    fontFamily: 'serif',
    fontSize: 18,
    variants: [
      {
        id: 'classic',
        name: 'Classic',
        background: '#f8fafc',
        surface: '#ffffff',
      },
      {
        id: 'warm',
        name: 'Warm',
        background: '#fdf3e7',
        surface: '#fffaf3',
        text: '#3a2a1a',
      },
      {
        id: 'blue',
        name: 'Blue',
        background: '#eef4fb',
        surface: '#ffffff',
        text: '#102a43',
      },
    ],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#e11d48',
      accent: '#facc15',
      background: '#1c0a24',
      surface: '#2d1340',
      text: '#ffe9d6',
      muted: '#c48fb0',
    },
    fontFamily: 'playfair',
    fontSize: 18,
    variants: [
      {
        id: 'classic',
        name: 'Classic',
        background: '#1c0a24',
        surface: '#2d1340',
      },
      { id: 'dusk', name: 'Dusk', background: '#230a10', surface: '#3a1220' },
    ],
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#22c55e',
      secondary: '#84cc16',
      accent: '#a3e635',
      background: '#052e16',
      surface: '#14532d',
      text: '#ecfdf5',
      muted: '#86efac',
    },
    fontFamily: 'sans',
    fontSize: 18,
    variants: [
      {
        id: 'classic',
        name: 'Classic',
        background: '#052e16',
        surface: '#14532d',
      },
      { id: 'moss', name: 'Moss', background: '#0a2e1a', surface: '#1a4a2e' },
    ],
  },
  {
    id: 'mono',
    name: 'Terminal',
    colors: {
      primary: '#00e676',
      secondary: '#00b0ff',
      accent: '#ffd600',
      background: '#000000',
      surface: '#0d0d0d',
      text: '#e0e0e0',
      muted: '#616161',
    },
    fontFamily: 'mono',
    fontSize: 16,
  },
];

export const themeById = (id: string): DeckTheme => THEMES.find((t) => t.id === id) ?? THEMES[0];

export const FONT_OPTIONS: Array<{ id: FontFamily; label: string }> = [
  { id: 'sans', label: 'Inter' },
  { id: 'serif', label: 'Georgia' },
  { id: 'mono', label: 'JetBrains Mono' },
  { id: 'playfair', label: 'Playfair Display' },
  { id: 'space-grotesk', label: 'Space Grotesk' },
];
