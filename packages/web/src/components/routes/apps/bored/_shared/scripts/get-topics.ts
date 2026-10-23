import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Niche = { emoji: string; value: string; label: string; topics: string[] };
type Category = {
  emoji: string;
  value: string;
  label: string;
  niches: Niche[];
};

const main = () => {
  const game = process.argv[2];
  if (!game) {
    console.error('Usage: npx tsx _shared/scripts/get-topics.ts <game>');
    process.exit(1);
  }

  const fileNames: Record<string, string> = {
    research: 'topics.json',
    develop: 'skills.json',
    build: 'products.json',
  };
  const jsonFile = fileNames[game];
  if (!jsonFile) {
    console.error(`Unknown game: "${game}". Use: research | develop | build`);
    process.exit(1);
  }
  const jsonPath = resolve(__dirname, '../../', game, 'data', jsonFile);
  const categories: Category[] = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  console.log('category_value,category_label,niche_value,niche_label,topic');
  for (const c of categories) {
    for (const n of c.niches) {
      for (const t of n.topics) {
        console.log(`${c.value},${c.label},${n.value},${n.label},${t}`);
      }
    }
  }
};

main();
