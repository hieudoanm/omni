import { FC, useCallback, useMemo, useState } from 'react';

import { LoremUnit, UNIT_CONFIG, generate } from './utils';

export const LoremIpsum: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [unit, setUnit] = useState<LoremUnit>('paragraphs');
  const [count, setCount] = useState(3);
  const [copied, setCopied] = useState(false);

  const config = UNIT_CONFIG[unit];

  const text = useMemo(() => generate(count, unit), [count, unit]);

  const handleCount = (delta: number) => {
    setCount((c) => Math.max(config.min, Math.min(config.max, c + delta * config.step)));
  };

  const handleCountInput = (raw: string) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    setCount(Math.max(config.min, Math.min(config.max, parsed)));
  };

  const handleUnitChange = (next: LoremUnit) => {
    setUnit(next);
    setCount((c) => {
      const nextConfig = UNIT_CONFIG[next];
      return Math.max(nextConfig.min, Math.min(c, nextConfig.max));
    });
  };

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  const chars = text.length;
  const words = text.split(/\s+/).length;
  const bytes = new TextEncoder().encode(text).length;
  const label = count === 1 ? config.singular : config.plural;
  const showPresets = unit === 'paragraphs' || unit === 'lists';

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4 p-8'>
      <div role='tablist' className='tabs tabs-boxed tabs-sm'>
        {(Object.keys(UNIT_CONFIG) as LoremUnit[]).map((u) => (
          <button
            key={u}
            role='tab'
            type='button'
            className={`tab capitalize ${unit === u ? 'tab-active' : ''}`}
            onClick={() => handleUnitChange(u)}>
            {u}
          </button>
        ))}
      </div>

      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='join'>
            <button
              type='button'
              onClick={() => handleCount(-1)}
              disabled={count <= config.min}
              aria-label='Decrease count'
              className='btn join-item btn-sm w-10 font-mono text-base'>
              −
            </button>
            <input
              type='number'
              data-testid='lorem-count'
              min={config.min}
              max={config.max}
              step={config.step}
              value={count}
              onChange={(e) => handleCountInput(e.target.value)}
              className='input input-bordered input-sm join-item w-24 text-center font-mono tabular-nums'
            />
            <button
              type='button'
              onClick={() => handleCount(1)}
              disabled={count >= config.max}
              aria-label='Increase count'
              className='btn join-item btn-sm w-10 font-mono text-base'>
              +
            </button>
          </div>
          <span data-testid='lorem-unit-label' className='text-sm opacity-70'>
            {label}
          </span>
        </div>
        {showPresets && (
          <div className='flex items-center gap-3'>
            <div className='bg-base-content/20 h-6 w-px' aria-hidden='true' />
            {[1, 3, 5].map((n) => (
              <button
                key={n}
                type='button'
                onClick={() => setCount(n)}
                className='btn btn-ghost btn-xs'>
                ×{n}
              </button>
            ))}
          </div>
        )}
      </div>

      <textarea
        className='textarea textarea-bordered h-64 w-full resize-y text-sm leading-relaxed'
        value={text}
        readOnly
      />

      <div className='flex items-center justify-between gap-3'>
        <div data-testid='lorem-stats' className='flex gap-3 text-xs opacity-50'>
          <span className='font-mono'>{chars.toLocaleString()} chars</span>
          <span className='font-mono'>{words.toLocaleString()} words</span>
          <span className='font-mono'>{bytes.toLocaleString()} bytes</span>
        </div>
        <button
          type='button'
          className={`btn btn-sm ${copied ? 'btn-success' : 'btn-primary'}`}
          onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
LoremIpsum.displayName = 'LoremIpsum';
