import { FC, useMemo, useState } from 'react';
import { convert } from '@/data/currencies';

import { CurrencyInput } from './CurrencyInput';
import { CurrencySelect } from './CurrencySelect';
import { ConversionResult } from './ConversionResult';
import { QuickPairs } from './QuickPairs';

export const CurrencyTab: FC = () => {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('SGD');
  const [amount, setAmount] = useState<string>('1');

  const converted = useMemo(() => {
    const n = Number.parseFloat(amount);
    if (Number.isNaN(n) || n < 0) return null;
    return convert(n, from, to);
  }, [amount, from, to]);

  return (
    <div className='flex flex-col gap-3 p-3'>
      <CurrencyInput amount={amount} onChange={setAmount} />

      <CurrencySelect label='From' value={from} onChange={setFrom} />

      <button
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
        className='btn btn-outline btn-sm w-full font-mono tracking-widest'>
        ⇅ Swap
      </button>

      <CurrencySelect label='To' value={to} onChange={setTo} />

      <ConversionResult amount={amount} from={from} to={to} converted={converted} />

      <hr className='border-base-300 my-1' />

      <QuickPairs from={from} to={to} onSelect={setTo} />

      <p className='text-base-content/20 pt-1 text-center font-mono text-[10px] tracking-widest uppercase'>
        Rates via ECB · 20 Mar 2026
      </p>
    </div>
  );
};
CurrencyTab.displayName = 'CurrencyTab';
