import { QUICK_PAIRS, CURRENCY_NAMES, convert } from '@/data/currencies';
import { FC } from 'react';

export const QuickPairs: FC<{
  from: string;
  to: string;
  onSelect: (v: string) => void;
}> = ({ from, to, onSelect }) => (
  <div>
    <p className='text-base-content/30 mb-2 font-mono text-[10px] tracking-widest uppercase'>
      1 {from} vs majors
    </p>
    <div className='flex flex-col gap-1'>
      {QUICK_PAIRS.filter((c) => c !== from).map((currency) => {
        const rate = convert(1, from, currency);
        const isTarget = currency === to;
        return (
          <div
            key={currency}
            onClick={() => onSelect(currency)}
            className={`flex cursor-pointer items-center justify-between rounded-full px-2 py-1.5 transition-all duration-150 ${
              isTarget ? 'bg-primary/10 ring-primary/30 ring-1' : 'hover:bg-base-300'
            }`}>
            <div className='flex items-center gap-2'>
              <span
                className={`font-mono text-xs font-normal tracking-wider ${isTarget ? 'text-primary' : 'opacity-70'}`}>
                {currency}
              </span>
              <span className='text-base-content/30 text-[10px] tracking-wide'>
                {CURRENCY_NAMES[currency]?.split(' ')[0]}
              </span>
            </div>
            <span
              className={`font-mono text-xs tabular-nums ${isTarget ? 'text-primary font-normal' : 'opacity-60'}`}>
              {rate.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);
QuickPairs.displayName = 'QuickPairs';
