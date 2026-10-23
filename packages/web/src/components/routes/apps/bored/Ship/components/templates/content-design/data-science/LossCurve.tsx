import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const LossCurve: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const epochs = (data.epochs as number) ?? 0;
  const trainLoss = (data.trainLoss as number[]) ?? [];
  const valLoss = (data.valLoss as number[]) ?? [];
  const bestEpoch = (data.bestEpoch as number) ?? 0;

  const allValues = [...trainLoss, ...valLoss];
  const maxVal = Math.max(...allValues, 0.01);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;

  const toY = (v: number) => ((v - minVal) / range) * 100;
  const toX = (i: number, len: number) => (i / (len - 1)) * 100;

  const buildPath = (values: number[]) =>
    values
      .map((v, i) => {
        const x = toX(i, values.length);
        const y = 100 - toY(v);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

  const trainPath = trainLoss.length > 1 ? buildPath(trainLoss) : '';
  const valPath = valLoss.length > 1 ? buildPath(valLoss) : '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 text-center'>
        <h2 className='text-accent text-[10px] font-bold tracking-[0.2em] uppercase'>Loss Curve</h2>
        {title && <h3 className='text-base-content mt-1 text-sm font-bold'>{title}</h3>}
      </div>
      <div className='flex flex-1 flex-col items-center justify-center gap-2'>
        <svg viewBox='0 0 100 100' className='h-48 w-full'>
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1='0'
              y1={y}
              x2='100'
              y2={y}
              className='stroke-base-300'
              strokeWidth='0.3'
            />
          ))}
          {trainPath && (
            <path d={trainPath} fill='none' className='stroke-primary' strokeWidth='1.5' />
          )}
          {valPath && (
            <path
              d={valPath}
              fill='none'
              className='stroke-error'
              strokeWidth='1.5'
              strokeDasharray='2 1'
            />
          )}
          {bestEpoch > 0 && bestEpoch <= trainLoss.length && (
            <circle
              cx={toX(bestEpoch - 1, trainLoss.length)}
              cy={100 - toY(trainLoss[bestEpoch - 1])}
              r='2'
              className='fill-primary'
            />
          )}
        </svg>
        <div className='flex gap-4 text-[9px]'>
          <div className='flex items-center gap-1'>
            <div className='bg-primary h-0.5 w-3' />
            <span className='text-neutral'>Train</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='bg-error h-0.5 w-3' style={{ borderStyle: 'dashed' }} />
            <span className='text-neutral'>Validation</span>
          </div>
        </div>
        <div className='text-neutral text-[9px]'>
          {epochs} epochs · Best: epoch {bestEpoch}
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

LossCurve.displayName = 'LossCurve';
