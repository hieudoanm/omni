import type { FC } from 'react';

export const PostDots: FC<{
  total: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}> = ({ total, activeIndex, onSelect }) => (
  <div className='mt-3 flex justify-center gap-1.5'>
    {Array.from({ length: total }, (_, i) => (
      <button
        key={i}
        onClick={() => onSelect(i)}
        aria-label={`Go to post ${i + 1}`}
        className={`h-1.5 cursor-pointer rounded-full transition-all ${
          i === activeIndex ? 'bg-primary w-4' : 'bg-base-300 w-1.5'
        }`}
      />
    ))}
  </div>
);
