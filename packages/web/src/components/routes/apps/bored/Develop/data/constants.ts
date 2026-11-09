import type { Category, Item } from '../../_shared/types';
import data from './skills.json';

export const CATEGORIES: Category[] = [
  { emoji: '✦', value: 'general', label: 'General' },
  ...data.map(({ emoji, value, label }) => ({ emoji, value, label })),
];

export const SKILL_TYPES: Item[] = [
  { emoji: '✨', value: 'all', label: 'All Skills', category: 'general' },
  ...data.flatMap(({ value: cat, niches }) =>
    niches.map(({ emoji, value, label }) => ({
      emoji,
      value,
      label,
      category: cat,
    })),
  ),
];

const nicheSkills: Record<string, string[]> = Object.fromEntries(
  data.flatMap(({ niches }) => niches.map(({ value, topics }) => [value, topics])),
);

const allSkills = Object.values(nicheSkills).flat();

export const SKILLS: Record<string, string[]> = {
  ...nicheSkills,
  all: allSkills,
};

export const TOTAL_SKILLS = allSkills.length;
