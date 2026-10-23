import type { FC } from 'react';

export const NavButton: FC<{
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}> = ({ direction, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className='btn btn-ghost btn-xs border-base-content/20 bg-base-100 absolute top-1/2 z-10 size-8 -translate-y-1/2 rounded-full border disabled:opacity-20'
    style={direction === 'prev' ? { left: '-0.75rem' } : { right: '-0.75rem' }}>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={direction === 'prev' ? '16' : '18'}
      height={direction === 'prev' ? '16' : '18'}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'>
      {direction === 'prev' ? <path d='m15 18-6-6 6-6' /> : <path d='m9 18 6-6-6-6' />}
    </svg>
  </button>
);
