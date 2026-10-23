'use client';

import { BoredGame } from '../_shared';
import { CATEGORIES, NICHES, TOTAL_TOPICS, TOPICS } from './data/constants';
import { HOW_TO } from './data/howToContent';

export const Research = () => (
  <BoredGame
    title='Deep Research'
    itemLabel='Niche'
    itemLabelPlural='niches'
    actionLabel='Research in Depth with AI'
    howToTitle='How to Research with AI'
    totalLabel='Topics'
    rollValue='topic'
    sourceName='Unprompted'
    sourceUrl='https://www.unprompted.cool/'
    categories={CATEGORIES}
    items={NICHES}
    topicsMap={TOPICS}
    total={TOTAL_TOPICS}
    content={HOW_TO}
  />
);
