import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DATA_DIR = resolve(__dirname, '..');
const TXT_PATH = resolve(DATA_DIR, 'queries.txt');
const JSON_PATH = resolve(DATA_DIR, 'queries.json');

const main = () => {
  const queries = readFileSync(TXT_PATH, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((query, index, arr) => arr.indexOf(query) === index);

  writeFileSync(JSON_PATH, JSON.stringify(queries, null, 2) + '\n');

  queries.sort();

  console.log(`✓ ${queries.length} queries → queries.json`);
};

main();
