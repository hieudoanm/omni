export const WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'ut',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'ut',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'dolor',
  'in',
  'reprehenderit',
  'in',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'dolore',
  'eu',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'in',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
];

export type LoremUnit = 'paragraphs' | 'words' | 'bytes' | 'lists';

export interface UnitConfig {
  singular: string;
  plural: string;
  min: number;
  max: number;
  step: number;
}

export const UNIT_CONFIG: Record<LoremUnit, UnitConfig> = {
  paragraphs: {
    singular: 'paragraph',
    plural: 'paragraphs',
    min: 1,
    max: 20,
    step: 1,
  },
  words: { singular: 'word', plural: 'words', min: 10, max: 200, step: 1 },
  bytes: { singular: 'byte', plural: 'bytes', min: 100, max: 5000, step: 100 },
  lists: {
    singular: 'list item',
    plural: 'list items',
    min: 1,
    max: 20,
    step: 1,
  },
};

const sentenceWords = (wordCount: number): string[] => {
  const start = Math.floor(Math.random() * (WORDS.length - wordCount));
  return WORDS.slice(start, start + wordCount);
};

export const sentence = (wordCount: number): string => {
  const words = sentenceWords(wordCount);
  const line = words.join(' ');
  return line.charAt(0).toUpperCase() + line.slice(1) + '.';
};

export const paragraph = (sentences: number): string =>
  Array.from({ length: sentences }, () => sentence(8 + Math.floor(Math.random() * 6))).join(' ');

const paragraphText = (): string => paragraph(3 + Math.floor(Math.random() * 4));

export const generateParagraphs = (count: number): string =>
  Array.from({ length: count }, () => paragraphText()).join('\n\n');

export const generateWords = (count: number): string => {
  const words: string[] = [];
  while (words.length < count) {
    sentenceWords(8 + Math.floor(Math.random() * 6)).forEach((w) => words.push(w));
  }
  return words.slice(0, count).join(' ');
};

const byteLength = (text: string): number => new TextEncoder().encode(text).length;

export const generateBytes = (count: number): string => {
  let text = '';
  while (byteLength(text) < count) {
    text = text ? `${text} ${paragraphText()}` : paragraphText();
  }
  return text.slice(0, count);
};

export const generateLists = (count: number): string =>
  Array.from({ length: count }, () => `• ${sentence(8 + Math.floor(Math.random() * 6))}`).join(
    '\n',
  );

export const generate = (count: number, unit: LoremUnit): string => {
  switch (unit) {
    case 'words':
      return generateWords(count);
    case 'bytes':
      return generateBytes(count);
    case 'lists':
      return generateLists(count);
    default:
      return generateParagraphs(count);
  }
};
