import { convert } from '@/data/currencies';
import { FC } from 'react';

export const ConversionResult: FC<{
  amount: string;
  from: string;
  to: string;
  converted: number | null;
}> = ({ amount, from, to, converted }) => (
  <div className='bg-base-100 rounded-box border-base-300 border p-3 text-center'>
    {converted !== null ? (
      <>
        <p className='text-base-content/40 mb-1 font-mono text-[10px] tracking-widest uppercase'>
          {parseFloat(amount).toLocaleString()} {from} =
        </p>
        <p className='text-primary font-mono text-2xl font-normal tracking-tight'>
          {converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })}
          <span className='text-base-content/50 ml-1.5 text-base'>{to}</span>
        </p>
        <p className='text-base-content/30 mt-1 font-mono text-[10px]'>
          1 {from} ={' '}
          {convert(1, from, to).toLocaleString(undefined, {
            minimumFractionDigits: 4,
            maximumFractionDigits: 6,
          })}{' '}
          {to}
        </p>
      </>
    ) : (
      <p className='text-base-content/30 text-xs'>Enter a valid amount</p>
    )}
  </div>
);
ConversionResult.displayName = 'ConversionResult';
