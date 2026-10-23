export interface WordStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
}

export type TextTransform = 'lowercase' | 'uppercase' | 'trim';

const READING_WPM = 200;

export const computeWordStats = (text: string): WordStats => {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const minutes = Math.ceil(words / READING_WPM);
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words,
    lines: text ? text.split('\n').length : 0,
    sentences: text ? text.split(/[.!?]+/).filter(Boolean).length : 0,
    paragraphs: text ? text.split(/\n\s*\n/).filter((part) => part.trim().length > 0).length : 0,
    readingTime: minutes < 1 ? '<1 min' : `${minutes} min`,
  };
};

export const applyTextTransform = (text: string, transform: TextTransform): string => {
  switch (transform) {
    case 'lowercase':
      return text.toLowerCase();
    case 'uppercase':
      return text.toUpperCase();
    case 'trim':
      return text.replace(/\s+/g, ' ').trim();
  }
};
