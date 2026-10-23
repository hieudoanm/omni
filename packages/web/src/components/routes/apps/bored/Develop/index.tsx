'use client';

import { BoredGame } from '../_shared';
import { CATEGORIES, SKILL_TYPES, TOTAL_SKILLS, SKILLS } from './data/constants';
import { HOW_TO } from './data/howToContent';

export const Develop = () => (
  <BoredGame
    title='Develop Skills'
    itemLabel='Skill'
    itemLabelPlural='skills'
    actionLabel='Develop It with AI'
    howToTitle='How to Develop Skills with AI'
    totalLabel='Skills'
    rollValue='skill'
    sourceName='Bored'
    sourceUrl='https://bored-api.appbrewery.com/'
    categories={CATEGORIES}
    items={SKILL_TYPES}
    topicsMap={SKILLS}
    total={TOTAL_SKILLS}
    content={HOW_TO}
  />
);
