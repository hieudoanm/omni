'use client';

import { FC, useState, useCallback } from 'react';

import { RedirectStep } from './utils';

export const TextUrlTracer: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<RedirectStep[]>([]);
  const [error, setError] = useState('');
  const [timeout, setTimeout_] = useState(5);

  const handleTrace = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setSteps([]);

    const traceUrl = url.startsWith('http') ? url : `https://${url}`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout * 1000);

    try {
      const resp = await fetch('/api/trace-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: traceUrl, timeout }),
        signal: controller.signal,
      });
      clearTimeout(id);
      if (!resp.ok) {
        setError(`Server error: ${resp.status}`);
        return;
      }
      const data = await resp.json();
      setSteps(data.steps || []);
      if (data.error) setError(data.error);
    } catch {
      clearTimeout(id);
      setSteps([{ url: traceUrl, status: 0, statusText: 'Request failed or timed out' }]);
    }
    setLoading(false);
  }, [url, timeout]);

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='flex flex-col gap-4'>
        <div className='flex gap-2'>
          <input
            type='url'
            className='input input-bordered flex-1 text-sm'
            placeholder='https://example.com'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            className='btn btn-primary btn-sm'
            disabled={!url.trim() || loading}
            onClick={handleTrace}>
            {loading ? <span className='loading loading-spinner' /> : 'Trace'}
          </button>
        </div>

        <label className='flex items-center gap-2 text-xs'>
          <span>Timeout (s):</span>
          <input
            type='number'
            min={1}
            max={30}
            className='input input-bordered input-xs w-16'
            value={timeout}
            onChange={(e) => setTimeout_(Number(e.target.value))}
          />
        </label>

        {error && (
          <div className='bg-base-content/10 text-base-content/60 rounded p-3 text-xs'>{error}</div>
        )}

        {steps.length > 0 && (
          <div className='flex flex-col gap-2'>
            <p className='text-base-content/40 text-[10px] font-normal tracking-widest uppercase'>
              Redirect Chain ({steps.length} hop{steps.length > 1 ? 's' : ''})
            </p>
            {steps.map((step, i) => (
              <div key={i} className='bg-base-200 flex items-start gap-3 rounded p-3'>
                <span className='mt-1 font-mono text-xs font-normal'>{i + 1}.</span>
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-mono text-xs'>{step.url}</p>
                  {step.status > 0 && (
                    <span
                      className={`mt-1 inline-block rounded px-1.5 py-0.5 font-mono text-[10px] ${
                        step.status >= 400
                          ? 'bg-base-content/20 text-base-content/60'
                          : step.status >= 300
                            ? 'bg-base-content/10 text-base-content/40'
                            : 'bg-base-content/5 text-base-content/30'
                      }`}>
                      {step.status} {step.statusText}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
TextUrlTracer.displayName = 'TextUrlTracer';
