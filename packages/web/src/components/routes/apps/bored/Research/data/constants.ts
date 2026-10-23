import type { Category, Item } from '../../_shared/types';
import data from './topics.json';

export const CATEGORIES: Category[] = [
  { emoji: '✦', value: 'general', label: 'General' },
  ...data.map(({ emoji, value, label }) => ({ emoji, value, label })),
];

export const NICHES: Item[] = [
  { emoji: '✨', value: 'all', label: 'All Topics', category: 'general' },
  ...data.flatMap(({ value: cat, niches }) =>
    niches.map(({ emoji, value, label }) => ({
      emoji,
      value,
      label,
      category: cat,
    })),
  ),
];

const nicheTopics: Record<string, string[]> = Object.fromEntries(
  data.flatMap(({ niches }) => niches.map(({ value, topics }) => [value, topics])),
);

const allTopics = Object.values(nicheTopics).flat();

export const TOPICS: Record<string, string[]> = {
  ...nicheTopics,
  all: allTopics,
};

export const TOTAL_TOPICS = allTopics.length;
