import fs from 'node:fs';
import path from 'node:path';

const CSV_PATH = path.join(__dirname, '..', 'projects.csv');
const JSON_PATH = path.join(__dirname, '..', 'projects.json');

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  web: { emoji: '🌐', label: 'Web' },
  mobile: { emoji: '📱', label: 'Mobile' },
  desktop: { emoji: '💻', label: 'Desktop' },
  game: { emoji: '🎮', label: 'Game' },
  cli: { emoji: '⌨️', label: 'CLI' },
  'data-science': { emoji: '📊', label: 'Data Science' },
};

const TYPE_EMOJI: Record<string, string> = {
  model: '🧠',
  framework: '🔧',
  task: '🎯',
  deployment: '🚀',
  data: '💾',
  domain: '🏢',
  tool: '🛠️',
  platform: '📦',
  language: '💻',
  scope: '🎯',
  maturity: '🌱',
  integration: '🔗',
  category: '📂',
  feature: '✨',
  pricing: '💰',
  user: '👤',
  format: '📄',
  protocol: '📡',
  content: '📝',
  privacy: '🔒',
  engagement: '❤️',
  medium: '🎭',
  output: '📤',
  creator: '👨‍🎨',
  source: '📊',
  type: '📋',
  stack: '🏗️',
  scale: '📏',
  viz: '📐',
  cms: '📝',
  'e-commerce': '🛒',
  analytics: '📊',
  collaboration: '🤝',
  publishing: '📰',
  game: '🎮',
  lifestyle: '🌿',
  utility: '🔧',
  education: '📚',
  editor: '✏️',
  creative: '🎨',
  media: '🎬',
  communication: '💬',
  'dev-tool': '🛠️',
  automation: '🤖',
  monitoring: '📡',
  text: '📝',
  network: '🌐',
  file: '📁',
  puzzle: '🧩',
  platformer: '🏃',
  rpg: '⚔️',
  shooter: '🔫',
  strategy: '🧠',
  simulation: '🌍',
  analysis: '🔬',
  pipeline: '🔄',
  ml: '🧠',
  database: '🗄️',
  etl: '🔗',
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

const result: Category[] = Object.entries(CATEGORY_META).map(([id, meta]) => ({
  id,
  emoji: meta.emoji,
  label: meta.label,
  reels: Object.entries(groups[id] ?? {}).map(([type, options]) => ({
    type,
    emoji: TYPE_EMOJI[type] ?? '❓',
    label: type.charAt(0).toUpperCase() + type.slice(1),
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
