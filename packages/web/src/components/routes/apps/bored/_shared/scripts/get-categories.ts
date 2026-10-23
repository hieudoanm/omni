import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const main = () => {
  const game = process.argv[2];
  if (!game) {
    console.error('Usage: npx tsx _shared/scripts/get-categories.ts <game>');
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
  const categories: Array<{
    emoji: string;
    value: string;
    label: string;
    niches: unknown[];
  }> = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  console.log('emoji,value,label,niche_count');
  for (const c of categories) {
    console.log(`${c.emoji},${c.value},${c.label},${c.niches.length}`);
  }
};

main();
