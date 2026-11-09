import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Item = {
  emoji: string;
  value: string;
  label: string;
  topics: string[];
};

type Category = {
  emoji: string;
  value: string;
  label: string;
  niches: Item[];
};

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const main = () => {
  const game = process.argv[2];
  if (!game) {
    console.error('Usage: npx tsx _shared/scripts/convert-csv-to-json.ts <game>');
    console.error('  game: research | develop | build');
    process.exit(1);
  }

  const fileNames: Record<string, { csv: string; json: string }> = {
    research: { csv: 'topics.csv', json: 'topics.json' },
    develop: { csv: 'skills.csv', json: 'skills.json' },
    build: { csv: 'products.csv', json: 'products.json' },
  };
  const files = fileNames[game];
  if (!files) {
    console.error(`Unknown game: "${game}". Use: research | develop | build`);
    process.exit(1);
  }

  const dataDir = resolve(__dirname, '../../', game, 'data');
  const csvPath = resolve(dataDir, files.csv);
  const jsonPath = resolve(dataDir, files.json);

  const csv = readFileSync(csvPath, 'utf-8');
  const lines = csv.trim().split('\n');

  const parseCsvLine = (line: string): string[] => {
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
  };

  // Parse rows, skip header (column 5 is the last data column: topic/skill/product)
  const rows = lines.slice(1).map((line) => {
    const [catEmoji, _catValue, catLabel, nicheEmoji, _nicheValue, nicheLabel, lastCol] =
      parseCsvLine(line);
    return {
      catLabel,
      catEmoji,
      nicheLabel,
      nicheEmoji,
      topic: lastCol.trim(),
    };
  });

  // Group: category -> niche -> topics[]
  const catMap = new Map<
    string,
    {
      emoji: string;
      niches: Map<string, { emoji: string; label: string; topics: string[] }>;
    }
  >();

  for (const { catLabel, catEmoji, nicheLabel, nicheEmoji, topic } of rows) {
    let cat = catMap.get(catLabel);
    if (!cat) {
      cat = { emoji: catEmoji, niches: new Map() };
      catMap.set(catLabel, cat);
    }
    let niche = cat.niches.get(nicheLabel);
    if (!niche) {
      niche = { emoji: nicheEmoji, label: nicheLabel, topics: [] };
      cat.niches.set(nicheLabel, niche);
    }
    niche.topics.push(topic);
  }

  // Category sort order (research uses canonical order; others sort alphabetically)
  const categoryValueOrder: Record<string, number> = {
    sciences: 0,
    physics: 1,
    chemistry: 2,
    technology: 3,
    business: 4,
    health: 5,
    medical: 6,
    psychology: 7,
    arts: 8,
    humanities: 9,
    philosophy: 10,
    law: 11,
    maths: 12,
    history: 13,
    economy: 14,
    biology: 15,
    neuroscience: 16,
    sociology: 17,
    'political-science': 18,
    education: 19,
    linguistics: 20,
    literature: 21,
    music: 22,
    film: 23,
    architecture: 24,
    cybersecurity: 25,
    'data-science': 26,
    nutrition: 27,
    marketing: 28,
    investing: 29,
  };

  const sortCat = (a: Category, b: Category) => {
    const ai = categoryValueOrder[a.value];
    const bi = categoryValueOrder[b.value];
    if (ai !== undefined && bi !== undefined) return ai - bi;
    return a.value.localeCompare(b.value, 'en');
  };

  const categories: Category[] = Array.from(catMap.entries())
    .map(([catLabel, cat]) => {
      const value = slugify(catLabel);
      const niches: Item[] = Array.from(cat.niches.entries())
        .map(([, n]) => ({
          emoji: n.emoji,
          value: slugify(n.label),
          label: n.label,
          topics: [...new Set(n.topics)],
        }))
        .sort((a, b) => a.value.localeCompare(b.value, 'en'));
      return { emoji: cat.emoji, value, label: catLabel, niches };
    })
    .sort(sortCat);

  writeFileSync(jsonPath, JSON.stringify(categories, null, 2) + '\n');

  const totalNiches = categories.reduce((s, c) => s + c.niches.length, 0);
  const totalTopics = categories.reduce(
    (s, c) => s + c.niches.reduce((ss, n) => ss + n.topics.length, 0),
    0,
  );
  console.log(
    `✓ ${categories.length} categories, ${totalNiches} niches, ${totalTopics} topics → ${files.json}`,
  );
};

main();
