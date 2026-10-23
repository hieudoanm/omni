'use client';

import { FC } from 'react';
import { computeStats } from '@/lib/office/md/markdown';
import { extractWikilinks } from '@/lib/office/md/wikilinks';

interface StatsBarProps {
  content: string;
  noteCount: number;
  linkCount: number;
  danglingCount: number;
}

const StatItem: FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <span className='tooltip tooltip-top' data-tip={label}>
    <span className='text-primary'>{value}</span>
    <span className='text-base-content/40 ml-1'>{label}</span>
  </span>
);

export const StatsBar: FC<StatsBarProps> = ({ content, noteCount, linkCount, danglingCount }) => {
  const stats = computeStats(content);
  const links = extractWikilinks(content).length;

  return (
    <footer className='border-base-content/10 bg-base-200/50 flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-3 py-1.5 text-xs'>
      <StatItem label='characters' value={stats.characters} />
      <StatItem label='words' value={stats.words} />
      <StatItem label='paragraphs' value={stats.paragraphs} />
      <StatItem label='headings' value={stats.headings} />
      <span className='divider divider-horizontal mx-0 my-0 hidden w-0 sm:block' />
      <StatItem label='links' value={links} />
      <StatItem label='notes' value={noteCount} />
      <StatItem label='total links' value={linkCount} />
      {danglingCount > 0 && (
        <span className='text-warning'>
          {danglingCount} dangling link{danglingCount === 1 ? '' : 's'}
        </span>
      )}
    </footer>
  );
};
