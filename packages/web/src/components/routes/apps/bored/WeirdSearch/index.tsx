'use client';

import { FC } from 'react';
import { BoredGame } from '../_shared';
import { QUERIES } from './data/constants';
import { HOW_TO } from './data/howToContent';

export const WeirdSearch: FC = () => (
  <BoredGame
    title='Weird Search'
    itemLabel='Query'
    itemLabelPlural='queries'
    actionLabel='Search Weirdly with AI'
    howToTitle='How to Weird-Search with AI'
    totalLabel='Queries'
    rollValue='query'
    sourceName='Atlas Obscura'
    sourceUrl='https://www.atlasobscura.com/'
    categories={[{ emoji: '✦', value: 'general', label: 'General' }]}
    items={[{ emoji: '🎲', value: 'all', label: 'All Queries', category: 'general' }]}
    topicsMap={{ all: QUERIES }}
    total={QUERIES.length}
    content={HOW_TO}
  />
);
