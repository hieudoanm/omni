import fs from 'node:fs';
import path from 'node:path';

const CSV_PATH = path.join(__dirname, '..', 'stacks.csv');
const JSON_PATH = path.join(__dirname, '..', 'stacks.json');

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  web: { emoji: '🌐', label: 'Web' },
  mobile: { emoji: '📱', label: 'Mobile' },
  desktop: { emoji: '🖥️', label: 'Desktop' },
  game: { emoji: '🎮', label: 'Game' },
  cli: { emoji: '💻', label: 'CLI' },
  'data-science': { emoji: '📊', label: 'Data Science' },
};

const TYPE_EMOJI: Record<string, string> = {
  framework: '⚛️',
  styling: '💅',

  api: '🔗',
  database: '🗄️',
  project: '💡',
  'build-tool': '🔧',
  store: '🏪',
  backend: '⚙️',
  'ui-toolkit': '🎭',
  packaging: '📦',
  distribution: '🚀',
  updating: '🔄',
  engine: '🎮',
  rendering: '🎨',
  physics: '🌊',
  audio: '🎵',
  tooling: '🔧',
  language: '🔤',
  parser: '📋',
  testing: '🧪',
  runtime: '⚡',
  tui: '🖥️',
  viz: '📈',
  notebook: '📓',
  infra: '⚙️',
};

const csv = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = csv.trim().split('\n');
const [, ...rows] = lines;

interface Option {
  name: string;
  link: string;
}

interface Reel {
  type: string;
  emoji: string;
  label: string;
  options: Option[];
}

interface Category {
  id: string;
  emoji: string;
  label: string;
  reels: Reel[];
}

const groups: Record<string, Record<string, Option[]>> = {};

for (const row of rows) {
  const parsed = parseCSVLine(row);
  const [category, type, name, link] = parsed;
  if (!category || !type || !name) continue;
  if (!groups[category]) groups[category] = {};
  if (!groups[category][type]) groups[category][type] = [];
  groups[category][type].push({ name, link: link || '' });
}

const toLabel = (type: string): string =>
  type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const result: Category[] = Object.entries(CATEGORY_META).map(([id, meta]) => ({
  id,
  emoji: meta.emoji,
  label: meta.label,
  reels: Object.entries(groups[id] ?? {}).map(([type, options]) => ({
    type,
    emoji: TYPE_EMOJI[type] ?? '❓',
    label: toLabel(type),
    options,
  })),
}));

fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2) + '\n');
console.log(`Wrote ${JSON_PATH}`);

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}
