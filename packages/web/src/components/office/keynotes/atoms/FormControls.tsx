'use client';

import { useEffect, useState, type FC, type ReactNode } from 'react';
import { FiDroplet } from 'react-icons/fi';
import { PALETTE } from '@/lib/office/keynotes/color';
import { getRecentColors, recordRecentColor } from '@/lib/office/keynotes/recentColors';

export const PanelSection: FC<{
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = true }) => (
  <details className='group border-base-300 border-b' open={defaultOpen}>
    <summary className='flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-semibold tracking-wide uppercase opacity-80 select-none hover:opacity-100'>
      {title}
      <span className='text-xs opacity-40 transition-transform group-open:rotate-90'>›</span>
    </summary>
    <div className='px-3 pb-3'>{children}</div>
  </details>
);

export const ColorInput: FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  swatches?: boolean;
}> = ({ label, value, onChange, swatches = true }) => {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    setRecent(getRecentColors());
  }, []);
  const handle = (v: string) => {
    onChange(v);
    recordRecentColor(v);
    setRecent(getRecentColors());
  };
  return (
    <label className='flex items-center gap-2 text-sm'>
      <span className='w-16 shrink-0 truncate text-xs opacity-70'>{label}</span>
      <input
        type='color'
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
        onChange={(e) => handle(e.target.value)}
        className='border-base-300 size-6 cursor-pointer rounded border bg-transparent'
      />
      <input
        type='text'
        value={value}
        onChange={(e) => handle(e.target.value)}
        className='input input-xs input-bordered w-20 font-mono'
      />
      {recent.length > 0 && (
        <div className='flex flex-wrap gap-0.5'>
          {recent.map((c) => (
            <button
              key={c}
              type='button'
              onClick={() => handle(c)}
              className={`size-3.5 rounded-full border border-white/20 ${
                value.toLowerCase() === c.toLowerCase() ? 'ring-primary ring-2' : ''
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Recent color ${c}`}
            />
          ))}
        </div>
      )}
      {swatches && (
        <div className='flex flex-wrap gap-0.5'>
          {PALETTE.slice(0, 12).map((c) => (
            <button
              key={c}
              type='button'
              onClick={() => handle(c)}
              className={`size-3.5 rounded-full border border-white/20 ${
                value.toLowerCase() === c.toLowerCase() ? 'ring-primary ring-2' : ''
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      )}
    </label>
  );
};

export const EyeDropperButton: FC<{ onPick: (color: string) => void }> = ({ onPick }) => {
  const [supported] = useState(() => typeof window !== 'undefined' && 'EyeDropper' in window);
  if (!supported) return null;
  const pick = async () => {
    try {
      const ED = (
        window as unknown as {
          EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> };
        }
      ).EyeDropper;
      const res = await new ED().open();
      if (res?.sRGBHex) {
        onPick(res.sRGBHex);
        recordRecentColor(res.sRGBHex);
      }
    } catch {
      /* user cancelled the picker */
    }
  };
  return (
    <button
      type='button'
      onClick={() => void pick()}
      className='btn btn-ghost btn-xs gap-1'
      title='Pick a color from the screen'>
      <FiDroplet className='size-3.5' /> Eyedropper
    </button>
  );
};

export const NumberInput: FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}> = ({ label, value, onChange, min, max, step = 1 }) => (
  <label className='flex items-center gap-2 text-sm'>
    <span className='w-16 shrink-0 truncate text-xs opacity-70'>{label}</span>
    <input
      type='number'
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className='input input-xs input-bordered w-20'
    />
  </label>
);

export const Toggle: FC<{
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className='flex cursor-pointer items-center justify-between gap-2 text-xs'>
    <span className='opacity-80'>{label}</span>
    <input
      type='checkbox'
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className='toggle toggle-primary toggle-xs'
    />
  </label>
);

export const SelectInput: FC<{
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <label className='flex items-center gap-2 text-sm'>
    <span className='w-16 shrink-0 truncate text-xs opacity-70'>{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='select select-xs select-bordered flex-1'>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

export const TextArea: FC<{
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}> = ({ label, value, onChange, rows = 4 }) => (
  <label className='flex flex-col gap-1 text-sm'>
    {label && <span className='text-xs opacity-70'>{label}</span>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className='textarea textarea-bordered textarea-xs'
    />
  </label>
);
