'use client';

import { FC, useState, useCallback } from 'react';

export const EpochConvert: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [epoch, setEpoch] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [mode, setMode] = useState<'toDate' | 'toEpoch'>('toDate');

  const handleConvert = useCallback(() => {
    if (mode === 'toDate') {
      const ms = Number(epoch);
      if (isNaN(ms)) return;
      setDateStr(new Date(ms).toISOString().replace('T', ' ').slice(0, 19));
    } else {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      setEpoch(String(d.getTime()));
    }
  }, [mode, epoch, dateStr]);

  const handleNow = useCallback(() => {
    setEpoch(String(Date.now()));
    setMode('toDate');
  }, []);

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='flex flex-col gap-4'>
        <div className='flex gap-2'>
          <button
            className={`btn btn-sm flex-1 ${mode === 'toDate' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMode('toDate')}>
            Epoch → Date
          </button>
          <button
            className={`btn btn-sm flex-1 ${mode === 'toEpoch' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMode('toEpoch')}>
            Date → Epoch
          </button>
        </div>

        {mode === 'toDate' ? (
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-normal'>Unix Timestamp (ms)</label>
            <input
              type='number'
              className='input input-bordered font-mono text-sm'
              placeholder='e.g. 1719705600000'
              value={epoch}
              onChange={(e) => setEpoch(e.target.value)}
            />
            <button className='btn btn-ghost btn-xs self-end' onClick={handleNow}>
              Now
            </button>
          </div>
        ) : (
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-normal'>Date & Time</label>
            <input
              type='datetime-local'
              className='input input-bordered'
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
            />
          </div>
        )}

        <button
          className='btn btn-primary btn-sm'
          disabled={mode === 'toDate' ? !epoch : !dateStr}
          onClick={handleConvert}>
          Convert
        </button>

        {mode === 'toDate' && dateStr && (
          <div className='bg-base-200 rounded p-3'>
            <p className='text-base-content/40 mb-1 text-[10px] font-normal tracking-widest uppercase'>
              Human Date
            </p>
            <p className='font-mono text-lg font-normal'>{dateStr}</p>
          </div>
        )}

        {mode === 'toEpoch' && epoch && (
          <div className='bg-base-200 rounded p-3'>
            <p className='text-base-content/40 mb-1 text-[10px] font-normal tracking-widest uppercase'>
              Epoch (ms)
            </p>
            <p className='font-mono text-lg font-normal'>{epoch}</p>
          </div>
        )}

        <div className='border-base-300 border-t pt-3'>
          <p className='text-base-content/40 mb-1 text-[10px] font-normal tracking-widest uppercase'>
            Quick References
          </p>
          <div className='space-y-1 font-mono text-[11px]'>
            <button
              className='btn btn-ghost btn-xs w-full justify-start'
              onClick={() => {
                setEpoch(String(Date.now()));
                setMode('toDate');
              }}>
              1 day: {86400000}
            </button>
            <button
              className='btn btn-ghost btn-xs w-full justify-start'
              onClick={() => {
                setEpoch(String(Date.now() - 86400000));
                setMode('toDate');
              }}>
              Yesterday: {Date.now() - 86400000}
            </button>
            <button
              className='btn btn-ghost btn-xs w-full justify-start'
              onClick={() => {
                setEpoch('0');
                setMode('toDate');
              }}>
              Unix epoch: 0
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
EpochConvert.displayName = 'EpochConvert';
