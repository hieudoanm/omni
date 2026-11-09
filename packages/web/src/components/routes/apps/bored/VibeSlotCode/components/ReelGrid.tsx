import { FC } from 'react';
import type { Option } from '../data/constants';
import { ReelBox } from './ReelBox';

interface ReelState {
  emoji: string;
  label: string;
  current: Option;
}

interface ReelGridProps {
  display: ReelState[];
  spinningIndices: boolean[];
  onSpinSingle: (index: number) => void;
}

export const ReelGrid: FC<ReelGridProps> = ({ display, spinningIndices, onSpinSingle }) => (
  <div className='grid w-full grid-cols-2 gap-2 md:grid-cols-5 md:gap-4'>
    {display.map((reel, index) => {
      const isSpinning = spinningIndices[index];

      return (
        <div key={reel.label} className='flex flex-col items-center gap-1 sm:gap-2'>
          <button
            disabled={isSpinning}
            onClick={() => onSpinSingle(index)}
            className={`flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[10px] font-bold tracking-wider uppercase transition-colors sm:text-xs ${
              isSpinning ? 'text-base-content/40' : 'text-neutral hover:text-primary'
            }`}>
            <span className='text-xs whitespace-nowrap sm:text-sm'>
              {reel.emoji} {reel.label}
            </span>
          </button>
          <ReelBox
            label={reel.label}
            name={reel.current.name}
            link={reel.current.link}
            spinning={isSpinning}
          />
        </div>
      );
    })}
  </div>
);
