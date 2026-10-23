import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const TransferCard: FC<TemplateProps> = ({ data }) => {
  const player = (data.player as string) ?? '';
  const from = (data.from as string) ?? '';
  const to = (data.to as string) ?? '';
  const fee = (data.fee as string) ?? '';
  const contractLength = (data.contractLength as string) ?? '';
  const date = (data.date as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-4 text-center'>
        <h2 className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Transfer</h2>
      </div>
      <div className='flex flex-1 flex-col items-center justify-center gap-4'>
        <div className='text-center'>
          <div className='text-base-content text-lg font-black'>{player}</div>
          {date && <time className='text-neutral mt-1 text-xs'>{date}</time>}
        </div>
        <div className='flex items-center gap-4'>
          <div className='w-24 text-right'>
            <div className='text-base-content text-base font-bold'>{from}</div>
          </div>
          <div className='flex flex-col items-center'>
            <div className='bg-primary text-primary-content rounded px-3 py-1 text-xs font-black'>
              {fee}
            </div>
            <div className='text-primary mt-1 text-xs'>→</div>
          </div>
          <div className='w-24 text-left'>
            <div className='text-base-content text-base font-bold'>{to}</div>
          </div>
        </div>
        {contractLength && (
          <div className='border-base-300 rounded border px-3 py-1 text-xs'>
            <span className='text-neutral'>Contract: </span>
            <span className='text-base-content font-semibold'>{contractLength}</span>
          </div>
        )}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

TransferCard.displayName = 'TransferCard';
