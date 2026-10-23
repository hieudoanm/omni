import { CURRENCIES, CURRENCY_NAMES } from '@/data/currencies';
import { FC } from 'react';

export const CurrencySelect: FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className='form-control'>
    <label className='label py-1'>
      <span className='label-text text-base-content/50 text-[10px] tracking-widest uppercase'>
        {label}
      </span>
    </label>
    <select
      className='select select-bordered select-sm text-sm font-normal'
      value={value}
      onChange={(e) => onChange(e.target.value)}>
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c} — {CURRENCY_NAMES[c]}
        </option>
      ))}
    </select>
  </div>
);
CurrencySelect.displayName = 'CurrencySelect';
