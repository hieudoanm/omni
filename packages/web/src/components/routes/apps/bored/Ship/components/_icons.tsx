import type { FC } from 'react';

export const ChevronUpIcon: FC = () => (
  <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M5 15l7-7 7 7' />
  </svg>
);

export const ChevronDownIcon: FC = () => (
  <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
  </svg>
);

export const DuplicateIcon: FC = () => (
  <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
    />
  </svg>
);

export const TrashIcon: FC = () => (
  <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
    />
  </svg>
);

export const GripIcon: FC = () => (
  <svg className='text-neutral/30 h-3 w-3' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm-2 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10-14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-2 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z' />
  </svg>
);
