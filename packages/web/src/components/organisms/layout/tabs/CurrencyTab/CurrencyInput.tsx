import { FC } from 'react';

export const CurrencyInput: FC<{
  amount: string;
  onChange: (v: string) => void;
}> = ({ amount, onChange }) => (
  <div className='form-control'>
    <label className='label py-1'>
      <span className='label-text text-base-content/50 text-[10px] tracking-widest uppercase'>
        Amount
      </span>
    </label>
    <input
      type='number'
      min='0'
      step='any'
      value={amount}
      onChange={(e) => onChange(e.target.value)}
      className='input input-bordered input-sm w-full font-mono text-lg font-normal tracking-tight'
      placeholder='1.00'
    />
  </div>
);
CurrencyInput.displayName = 'CurrencyInput';
