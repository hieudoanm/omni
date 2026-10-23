import type { Category, Item } from '../../_shared/types';
import data from './products.json';

export const CATEGORIES: Category[] = [
  { emoji: '✦', value: 'general', label: 'General' },
  ...data.map(({ emoji, value, label }) => ({ emoji, value, label })),
];

export const PRODUCT_TYPES: Item[] = [
  { emoji: '✨', value: 'all', label: 'All Products', category: 'general' },
  ...data.flatMap(({ value: cat, niches }) =>
    niches.map(({ emoji, value, label }) => ({
      emoji,
      value,
      label,
      category: cat,
    })),
  ),
];

const nicheProducts: Record<string, string[]> = Object.fromEntries(
  data.flatMap(({ niches }) => niches.map(({ value, topics }) => [value, topics])),
);

const allProducts = Object.values(nicheProducts).flat();

export const PRODUCTS: Record<string, string[]> = {
  ...nicheProducts,
  all: allProducts,
};

export const TOTAL_PRODUCTS = allProducts.length;
