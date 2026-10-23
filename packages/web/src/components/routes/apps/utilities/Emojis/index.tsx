// components/modals/EmojisModal.tsx

import { emojis } from '@/components/routes/apps/utilities/data/emojis';
import { FC, useMemo, useState } from 'react';
import { EmojiMap, IMAGES_BASE } from './utils';

export const Emojis: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const entries = Object.entries(emojis as EmojiMap);
    if (!query) return entries;
    return entries.filter(([key]) => key.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      alert('Failed to copy');
    }
  };
  Emojis.displayName = 'Emojis';

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <p className='text-base-content/40 -mt-2 mb-1 text-[11px]'>
        {filtered.length} emoji{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* ── Search ── */}
      <div className='border-base-300 -mx-6 shrink-0 border-b px-4 py-3'>
        <input
          type='text'
          placeholder='Search emoji…'
          className='input input-bordered input-sm w-full'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* ── Grid ── */}
      <div className='-mx-6 overflow-y-auto px-4 py-3'>
        {filtered.length === 0 ? (
          <p className='text-base-content/25 py-12 text-center text-sm'>No emojis found.</p>
        ) : (
          <div
            className='grid gap-1'
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
            }}>
            {filtered.map(([key, value]) => {
              const isUnicode = !value.startsWith('http');
              const isCopied = copied === key;
              return (
                <button
                  key={key}
                  title={`:${key}:`}
                  onClick={() => handleCopy(value, key)}
                  className={`hover:bg-base-300 flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-colors ${
                    isCopied ? 'bg-primary/10' : ''
                  }`}>
                  {/* Emoji */}
                  <span className='text-2xl leading-none'>
                    {isUnicode ? (
                      value
                    ) : (
                      <img
                        src={`${IMAGES_BASE}/${key}.png`}
                        alt={key}
                        loading='lazy'
                        className='h-6 w-6'
                      />
                    )}
                  </span>
                  {/* Copied flash */}
                  {isCopied && <span className='text-primary text-[9px] font-normal'>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
