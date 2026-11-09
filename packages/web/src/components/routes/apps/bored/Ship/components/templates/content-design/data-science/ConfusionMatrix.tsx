import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const ConfusionMatrix: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const classes = (data.classes as string[]) ?? ['Positive', 'Negative'];
  const tp = (data.tp as number) ?? 0;
  const tn = (data.tn as number) ?? 0;
  const fp = (data.fp as number) ?? 0;
  const fn = (data.fn as number) ?? 0;
  const accuracy = (data.accuracy as string) ?? '';

  const total = tp + tn + fp + fn;

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 text-center'>
        <h2 className='text-accent text-[10px] font-bold tracking-[0.2em] uppercase'>
          Confusion Matrix
        </h2>
        {title && <h3 className='text-base-content mt-1 text-sm font-bold'>{title}</h3>}
      </div>
      <div className='flex flex-1 flex-col items-center justify-center gap-2'>
        <div className='grid grid-cols-[auto_1fr_1fr] gap-1 text-center'>
          <div />
          <div className='text-neutral text-[9px] font-bold uppercase'>Pred {classes[0]}</div>
          <div className='text-neutral text-[9px] font-bold uppercase'>Pred {classes[1]}</div>
          <div className='text-neutral flex items-center pr-2 text-[9px] font-bold uppercase'>
            Actual {classes[0]}
          </div>
          <div className='bg-success/10 text-success flex h-16 w-20 items-center justify-center rounded font-bold'>
            {tp}
          </div>
          <div className='bg-error/10 text-error flex h-16 w-20 items-center justify-center rounded font-bold'>
            {fn}
          </div>
          <div className='text-neutral flex items-center pr-2 text-[9px] font-bold uppercase'>
            Actual {classes[1]}
          </div>
          <div className='bg-error/10 text-error flex h-16 w-20 items-center justify-center rounded font-bold'>
            {fp}
          </div>
          <div className='bg-success/10 text-success flex h-16 w-20 items-center justify-center rounded font-bold'>
            {tn}
          </div>
        </div>
        {accuracy && (
          <div className='text-center'>
            <div className='text-neutral text-[9px] tracking-wider uppercase'>Accuracy</div>
            <div className='text-primary text-lg font-black'>{accuracy}</div>
          </div>
        )}
        <div className='text-neutral text-[9px]'>n = {total}</div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

ConfusionMatrix.displayName = 'ConfusionMatrix';
