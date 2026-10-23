export type PuzzleType = 'palindrome' | 'emordnilap';

export interface Puzzle {
  letters: string[];
  answer: string;
  type: PuzzleType;
}

export interface Definition {
  partOfSpeech: string;
  definition: string;
}
export interface WordData {
  word: string;
  definitions: Definition[];
}
