import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

type NicheDef = { emoji: string; label: string; products: string[] };
type CatDef = { emoji: string; label: string; niches: NicheDef[] };

const dataDir = resolve(__dirname, '../../Build/data');
const nichesDir = resolve(dataDir, 'niches');
const csvPath = resolve(dataDir, 'products.csv');
const jsonPath = resolve(dataDir, 'products.json');

const files = readdirSync(nichesDir)
  .filter((f) => f.endsWith('.json'))
  .sort();

const categories = files.map((file) => {
  const cat: CatDef = JSON.parse(readFileSync(resolve(nichesDir, file), 'utf-8'));
  return {
    emoji: cat.emoji,
    value: slugify(cat.label),
    label: cat.label,
    niches: cat.niches.map((n) => ({
      emoji: n.emoji,
      value: slugify(n.label),
      label: n.label,
      topics: n.products,
    })),
  };
});

const header =
  'category_emoji,category_value,category_label,niche_emoji,niche_value,niche_label,product';
const escapeCsv = (s: string) => {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const csvLines = [header];
for (const cat of categories)
  for (const niche of cat.niches)
    for (const product of niche.topics)
      csvLines.push(
        [
          escapeCsv(cat.emoji),
          escapeCsv(cat.value),
          escapeCsv(cat.label),
          escapeCsv(niche.emoji),
          escapeCsv(niche.value),
          escapeCsv(niche.label),
          escapeCsv(product),
        ].join(','),
      );

writeFileSync(csvPath, csvLines.join('\n') + '\n');
writeFileSync(jsonPath, JSON.stringify(categories, null, 2) + '\n');

const totalNiches = categories.reduce((s, c) => s + c.niches.length, 0);
const totalProducts = categories.reduce(
  (s, c) => s + c.niches.reduce((ss, n) => ss + n.topics.length, 0),
  0,
);
console.log(`✓ ${categories.length} categories, ${totalNiches} niches, ${totalProducts} products`);
console.log(`  → ${csvPath}`);
console.log(`  → ${jsonPath}`);
