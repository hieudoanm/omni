'use client';

import {
  TimeLeft,
  calcProgress,
  diffParts,
  toDateInputValue,
} from '@/lib/office/calendar/countdown';
import { FC, useEffect, useRef, useState } from 'react';

export const CountdownModal: FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const defaultStart = new Date();
  const defaultEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('My Countdown');
  const [titleInput, setTitleInput] = useState('My Countdown');
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [startInput, setStartInput] = useState(toDateInputValue(defaultStart));
  const [endInput, setEndInput] = useState(toDateInputValue(defaultEnd));
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => diffParts(new Date(), defaultEnd));
  const [progress, setProgress] = useState(() => calcProgress(defaultStart, defaultEnd));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now < start) setTimeLeft(diffParts(now, start));
      else if (now > end) setTimeLeft(diffParts(end, now));
      else setTimeLeft(diffParts(now, end));
      setProgress(calcProgress(start, end));
    }, 1000);
    return () => clearInterval(timer);
  }, [start, end]);

  const handleSave = () => {
    if (!startInput || !endInput) return;
    setStart(new Date(startInput));
    setEnd(new Date(endInput));
    setTitle(titleInput);
    setEditing(false);
  };

  const units: [string, number][] = [
    ['yrs', timeLeft.years],
    ['mo', timeLeft.months],
    ['days', timeLeft.days],
    ['hrs', timeLeft.hours],
    ['min', timeLeft.minutes],
    ['sec', timeLeft.seconds],
  ];

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button className='btn btn-sm btn-ghost' onClick={open}>
        Countdown
      </button>

      <dialog ref={dialogRef} className='modal'>
        <div className='modal-box border-base-content/10 bg-base-100 border'>
          <div className='flex justify-between'>
            <h3 className='text-base-content mb-4 text-lg font-semibold'>Countdown</h3>

            <button
              onClick={() => setEditing((v) => !v)}
              className={`btn btn-outline btn-xs mb-2 font-mono tracking-widest ${editing ? 'btn-primary' : ''}`}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-1'>
                <p className='text-base-content/40 font-mono text-[10px] tracking-widest uppercase'>
                  Title
                </p>
                <input
                  type='text'
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className='input input-bordered input-sm w-full font-mono'
                />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1'>
                  <p className='text-base-content/40 font-mono text-[10px] tracking-widest uppercase'>
                    Start
                  </p>
                  <input
                    type='date'
                    value={startInput}
                    onChange={(e) => setStartInput(e.target.value)}
                    className='input input-bordered input-sm w-full font-mono'
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <p className='text-base-content/40 font-mono text-[10px] tracking-widest uppercase'>
                    End
                  </p>
                  <input
                    type='date'
                    value={endInput}
                    onChange={(e) => setEndInput(e.target.value)}
                    className='input input-bordered input-sm w-full font-mono'
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                className='btn btn-primary btn-sm w-full font-mono tracking-widest'>
                Save
              </button>
            </div>
          ) : (
            <>
              <p className='mb-2 text-center font-mono text-lg tracking-widest'>{title}</p>
              <div className='border-base-content/10 rounded-xl border p-4'>
                <div className='grid grid-cols-6 gap-2 text-center'>
                  {units.map(([label, value]) => (
                    <div key={label} className='flex flex-col items-center gap-1'>
                      <span className='font-mono text-2xl leading-none font-normal tabular-nums'>
                        {String(value).padStart(2, '0')}
                      </span>
                      <span className='text-base-content/30 font-mono text-[9px] tracking-widest uppercase'>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className='mt-2 flex flex-col gap-1.5'>
                <progress className='progress progress-primary w-full' value={progress} max='100' />
                <div className='flex justify-between font-mono text-[10px] opacity-30'>
                  <span>{start.toDateString()}</span>
                  <span>{progress.toFixed(1)}%</span>
                  <span>{end.toDateString()}</span>
                </div>
              </div>
            </>
          )}

          <div className='modal-action'>
            <button className='btn btn-sm' onClick={close}>
              Close
            </button>
          </div>
        </div>

        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};
CountdownModal.displayName = 'CountdownModal';
