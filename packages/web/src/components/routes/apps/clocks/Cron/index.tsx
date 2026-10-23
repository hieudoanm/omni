import { FC, useMemo, useState } from 'react';

import { FIELD_KEYS, FIELD_LABELS, PRESETS } from './constants';
import { parse, nextTimes } from './utils/parser';
import { cronToDescription, formatNext } from './utils/format';

export const Cron: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [expr, setExpr] = useState('* * * * *');
  const [editing, setEditing] = useState(false);
  const parts = expr.split(' ');
  const [minute, setMinute] = useState(parts[0]);
  const [hour, setHour] = useState(parts[1]);
  const [dayOfMonth, setDayOfMonth] = useState(parts[2]);
  const [month, setMonth] = useState(parts[3]);
  const [dayOfWeek, setDayOfWeek] = useState(parts[4]);

  const description = useMemo(() => cronToDescription(expr), [expr]);
  const next = useMemo(() => nextTimes(expr, 5), [expr]);
  const invalid = useMemo(() => parse(expr) === null, [expr]);

  const apply = (value: string) => {
    const p = value.split(' ');
    setExpr(value);
    setMinute(p[0]);
    setHour(p[1]);
    setDayOfMonth(p[2]);
    setMonth(p[3]);
    setDayOfWeek(p[4]);
    setEditing(false);
  };

  const sync = (m: string, h: string, dom: string, mon: string, dow: string) =>
    setExpr(`${m} ${h} ${dom} ${mon} ${dow}`);

  const fieldValue = (k: string) =>
    k === 'minute'
      ? minute
      : k === 'hour'
        ? hour
        : k === 'dayOfMonth'
          ? dayOfMonth
          : k === 'month'
            ? month
            : dayOfWeek;
  const setField = (k: string, v: string) => {
    if (k === 'minute') {
      setMinute(v);
      sync(v, hour, dayOfMonth, month, dayOfWeek);
    } else if (k === 'hour') {
      setHour(v);
      sync(minute, v, dayOfMonth, month, dayOfWeek);
    } else if (k === 'dayOfMonth') {
      setDayOfMonth(v);
      sync(minute, hour, v, month, dayOfWeek);
    } else if (k === 'month') {
      setMonth(v);
      sync(minute, hour, dayOfMonth, v, dayOfWeek);
    } else {
      setDayOfWeek(v);
      sync(minute, hour, dayOfMonth, month, v);
    }
  };

  const rangeHint = (k: string) =>
    k === 'minute'
      ? '0-59'
      : k === 'hour'
        ? '0-23'
        : k === 'dayOfMonth'
          ? '1-31'
          : k === 'month'
            ? '1-12'
            : '0-7';

  return (
    <>
      <div className='mb-3 flex items-center gap-2'>
        <button
          onClick={() => setEditing((v) => !v)}
          className={`btn btn-outline btn-xs font-mono tracking-widest ${editing ? 'btn-primary' : ''}`}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
        <div className='flex-1' />
        {!invalid && next.length > 0 && (
          <span className='text-base-content/30 font-mono text-[10px] tracking-widest'>
            Next: {formatNext(next[0])}
          </span>
        )}
      </div>
      <div className='mb-3 flex flex-wrap gap-1.5'>
        {PRESETS.map((p) => (
          <button
            key={p.value}
            className={`btn btn-xs font-mono ${expr === p.value ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => apply(p.value)}>
            {p.label}
          </button>
        ))}
      </div>
      {editing ? (
        <div className='grid grid-cols-5 gap-2'>
          {FIELD_KEYS.map((k) => (
            <div key={k} className='flex flex-col gap-1'>
              <p className='text-base-content/40 font-mono text-[10px] tracking-widest uppercase'>
                {FIELD_LABELS[k]}
              </p>
              <input
                type='text'
                value={fieldValue(k)}
                onChange={(e) => setField(k, e.target.value)}
                className={`input input-bordered input-sm w-full text-center font-mono ${invalid ? 'input-error' : ''}`}
                placeholder='*'
              />
              <p className='text-base-content/20 font-mono text-[8px] tracking-widest'>
                {rangeHint(k)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className='bg-base-200 border-base-300 mb-3 rounded-xl border p-4'>
            <div className='flex items-center justify-center gap-3'>
              {expr.split(' ').map((part, i) => (
                <div key={i} className='flex flex-col items-center gap-1'>
                  <span className='font-mono text-xl leading-none font-normal tabular-nums'>
                    {part}
                  </span>
                  <span className='text-base-content/30 font-mono text-[9px] tracking-widest uppercase'>
                    {FIELD_LABELS[FIELD_KEYS[i]]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {next.length > 0 && (
            <div className='flex flex-col gap-1'>
              <p className='text-base-content/40 mb-1 font-mono text-[10px] tracking-widest uppercase'>
                Upcoming executions
              </p>
              <div className='bg-base-200 border-base-300 rounded-lg border p-3'>
                {next.map((t, i) => (
                  <div key={i} className='font-mono text-sm leading-relaxed tabular-nums'>
                    {formatNext(t)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
Cron.displayName = 'Cron';
