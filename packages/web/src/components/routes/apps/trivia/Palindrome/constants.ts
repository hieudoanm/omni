import palindromes from '@/json/palindrome/palindrome.json';
import emordnilaps from '@/json/palindrome/emordnilap.json';
import { Puzzle } from './types';

const wordToPuzzle = (answer: string, type: Puzzle['type']): Puzzle => ({
  letters: answer.split(''),
  answer,
  type,
});

export const PUZZLES: Puzzle[] = [
  ...(palindromes as string[])
    .filter((i) => i.length > 5)
    .map((w) => wordToPuzzle(w, 'palindrome')),
  ...(emordnilaps as string[])
    .filter((i) => i.length > 5)
    .map((w) => wordToPuzzle(w, 'emordnilap')),
];

export const TIMER_START = 30;
