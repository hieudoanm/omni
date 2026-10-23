import { FC, useState } from 'react';

import { FONT_NAMES, renderFiglet } from './utils/render';

export const Figlet: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [text, setText] = useState('Hello, World!');
  const [font, setFont] = useState('Standard');
  const [copied, setCopied] = useState(false);

  const output = renderFiglet(text || 'Hello, World!', font);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  Figlet.displayName = 'Figlet';

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div onKeyDown={onKeyDown}>
        <div className='mb-3 flex gap-2'>
          <input
            autoFocus
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Type something…'
            maxLength={20}
            className='input input-bordered flex-1 font-mono'
          />
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className='select select-bordered'>
            {FONT_NAMES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className='border-base-300 mb-4 flex flex-wrap border-b'>
          {FONT_NAMES.map((f) => (
            <button
              key={f}
              className={`border-b-2 px-3 py-2 text-sm transition-colors ${
                font === f
                  ? 'border-primary text-primary'
                  : 'text-base-content/40 border-transparent'
              }`}
              onClick={() => setFont(f)}>
              {f}
            </button>
          ))}
        </div>

        <div className='bg-base-200 mb-3 overflow-x-auto rounded-xl p-4'>
          <pre className='text-base-content/80 font-mono text-xs leading-tight whitespace-pre'>
            {output}
          </pre>
        </div>

        <div className='mb-3 flex items-center justify-between text-xs opacity-40'>
          <span>{text.length}/20 chars · letters, digits, punctuation supported</span>
          <span>Rendered in {font}</span>
        </div>

        <div className='flex gap-2'>
          <button
            className={`btn btn-sm flex-1 ${copied ? 'btn-success' : 'btn-primary'}`}
            onClick={copy}>
            {copied ? '✓ Copied' : '📋 Copy ASCII'}
          </button>
          <button className='btn btn-ghost btn-sm' onClick={() => setText('')}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
