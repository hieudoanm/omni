'use client';

import { FC, useMemo } from 'react';
import { TbCopy, TbX } from 'react-icons/tb';
import { computeWordStats, type WordStats } from '@/lib/office/md/wordCounter';

interface WordCounterDialogProps {
  text: string;
  onClose: () => void;
}

const statEntries = (stats: WordStats): Array<[string, string, number]> => [
  ['characters', 'Characters', stats.characters],
  ['charactersNoSpaces', 'No Spaces', stats.charactersNoSpaces],
  ['words', 'Words', stats.words],
  ['lines', 'Lines', stats.lines],
  ['sentences', 'Sentences', stats.sentences],
  ['paragraphs', 'Paragraphs', stats.paragraphs],
];

export const WordCounterDialog: FC<WordCounterDialogProps> = ({ text, onClose }) => {
  const stats = useMemo(() => computeWordStats(text), [text]);

  const handleCopy = (): void => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
      onClick={onClose}>
      <div
        className='bg-base-100 border-base-content/10 w-full max-w-lg rounded-xl border p-4 shadow-2xl'
        onClick={(event) => event.stopPropagation()}
        data-testid='word-counter-dialog'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-base font-semibold'>Word counter</h2>
          <button
            className='btn btn-ghost btn-xs'
            onClick={onClose}
            aria-label='Close word counter'>
            <TbX size={16} />
          </button>
        </div>

        <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
          {statEntries(stats).map(([key, label, value]) => (
            <div
              key={key}
              className='bg-base-200 rounded-lg p-2 text-center'
              data-testid={`stat-${key}`}>
              <p className='text-base-content/40 text-[10px] tracking-widest uppercase'>{label}</p>
              <p className='mt-0.5 font-mono text-lg'>{value}</p>
            </div>
          ))}
          <div
            className='bg-base-200 col-span-2 rounded-lg p-2 text-center'
            data-testid='stat-readingTime'>
            <p className='text-base-content/40 text-[10px] tracking-widest uppercase'>
              Reading Time
            </p>
            <p className='mt-0.5 font-mono text-lg'>{stats.readingTime}</p>
          </div>
        </div>

        <div className='mt-3 flex'>
          <button
            className='btn btn-ghost btn-xs ml-auto'
            onClick={handleCopy}
            aria-label='Copy text'>
            <TbCopy size={14} />
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};
