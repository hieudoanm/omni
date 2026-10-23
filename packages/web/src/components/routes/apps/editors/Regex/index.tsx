import { FC, useCallback, useMemo, useState } from 'react';

import { generateRegex, testRegex } from './utils/regex';

export const Regex: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [input, setInput] = useState('user@example.com\nadmin@domain.org\ncontact@site.co');
  const [flags, setFlags] = useState('g');
  const [testInput, setTestInput] = useState('');
  const [customPattern, setCustomPattern] = useState('');

  const strings = useMemo(
    () =>
      input
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    [input],
  );
  const generated = useMemo(() => (strings.length > 0 ? generateRegex(strings) : null), [strings]);
  const pattern = customPattern || generated || '';
  const testLines = useMemo(
    () =>
      testInput
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    [testInput],
  );
  const results = useMemo(
    () => (pattern ? testRegex(pattern, flags, testLines) : []),
    [pattern, flags, testLines],
  );

  const copyPattern = useCallback(() => {
    navigator.clipboard.writeText(pattern);
  }, [pattern]);
  const copyFlags = useCallback(() => {
    navigator.clipboard.writeText(flags);
  }, [flags]);

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='flex flex-col gap-4'>
        <div>
          <label className='mb-1 block text-xs font-normal uppercase opacity-60'>
            Sample Strings (one per line)
          </label>
          <textarea
            className='textarea textarea-bordered h-28 w-full font-mono text-sm'
            placeholder='user1@example.com\nuser2@example.com\nadmin@example.com'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-normal uppercase opacity-60'>
            Regex Pattern
          </label>
          <div className='flex gap-2'>
            <input
              className='input input-bordered flex-1 font-mono text-sm'
              value={pattern}
              onChange={(e) => setCustomPattern(e.target.value)}
              placeholder='Generated or custom pattern...'
            />
            <div className='flex gap-1'>
              <input
                className='input input-bordered w-16 font-mono text-sm uppercase'
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder='g'
              />
              <button
                onClick={copyFlags}
                className='btn btn-ghost btn-square btn-sm'
                title='Copy flags'>
                F
              </button>
            </div>
            <button onClick={copyPattern} className='btn btn-primary btn-sm' disabled={!pattern}>
              Copy
            </button>
          </div>
          {generated && !customPattern && (
            <p className='mt-1 text-xs opacity-40'>
              Edit the pattern above to switch to custom mode
            </p>
          )}
        </div>
        <div>
          <label className='mb-1 block text-xs font-normal uppercase opacity-60'>
            Test Strings (one per line)
          </label>
          <textarea
            className='textarea textarea-bordered h-24 w-full font-mono text-sm'
            placeholder='user@example.com\nadmin@site.org\nnot-an-email'
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
          />
        </div>
        {testLines.length > 0 && pattern && (
          <div className='border-base-300 max-h-40 overflow-y-auto rounded-lg border'>
            {testLines.map((line, i) => (
              <div
                key={i}
                className={`border-base-200 flex items-center gap-3 border-b px-3 py-1.5 text-sm last:border-0 ${results[i] ? 'bg-base-content/8' : 'bg-base-content/5'}`}>
                <span className='text-lg'>{results[i] ? '✓' : '✗'}</span>
                <span className='font-mono'>{line}</span>
              </div>
            ))}
          </div>
        )}
        <p className='text-center text-xs opacity-40'>
          Enter 2+ sample strings to generate a regex pattern
        </p>
      </div>
    </div>
  );
};
Regex.displayName = 'Regex';
