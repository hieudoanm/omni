import emordnilaps from '@/json/palindrome/emordnilap.json';
import { WordData } from '../types';

export const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const isPalindrome = (word: string): boolean => word === word.split('').reverse().join('');

export const isEmordnilap = (word: string): boolean => {
  const rev = word.split('').reverse().join('');
  const list = emordnilaps as string[];
  return rev !== word && (list.includes(word) || list.includes(rev));
};

export const fetchDefinition = async (word: string): Promise<WordData | null> => {
  try {
    const url = `https://raw.githubusercontent.com/hieudoanm/hieudoanm.github.io/refs/heads/master/packages/data/english/words/${word.toLowerCase()}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
