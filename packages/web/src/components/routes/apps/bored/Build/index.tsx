'use client';

import { BoredGame } from '../_shared';
import { CATEGORIES, PRODUCT_TYPES, TOTAL_PRODUCTS, PRODUCTS } from './data/constants';
import { HOW_TO } from './data/howToContent';

export const Build = () => (
  <BoredGame
    title='Build Products'
    itemLabel='Product'
    itemLabelPlural='products'
    actionLabel='Build It with AI'
    howToTitle='How to Build Products with AI'
    totalLabel='Products'
    rollValue='product'
    sourceName='Build Your Own'
    sourceUrl='https://github.com/codecrafters-io/build-your-own-x'
    categories={CATEGORIES}
    items={PRODUCT_TYPES}
    topicsMap={PRODUCTS}
    total={TOTAL_PRODUCTS}
    content={HOW_TO}
  />
);
