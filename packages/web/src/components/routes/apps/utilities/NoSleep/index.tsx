import { FC, useEffect, useRef, useState } from 'react';

import { TimeUnit, WakeLockStatus, getElapsed, WAKE_LOCK_STATUS } from './utils';

const STATUS_STYLES: Record<WakeLockStatus, { badge: string; dot: string }> = {
  checking: { badge: 'badge-ghost', dot: 'bg-warning' },
  active: { badge: 'badge-success', dot: 'bg-success' },
  inactive: { badge: 'badge-ghost', dot: 'bg-base-content/40' },
  unsupported: { badge: 'badge-warning', dot: 'bg-warning' },
  denied: { badge: 'badge-error', dot: 'bg-error' },
};

export const NoSleep: FC<{ onClose: () => void }> = ({ onClose }) => {
  const startTimeRef = useRef<number>(Date.now());
  const [units, setUnits] = useState<TimeUnit[]>(getElapsed(startTimeRef.current));
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [wakeLockStatus, setWakeLockStatus] = useState<WakeLockStatus>('checking');
  const [wakeLockError, setWakeLockError] = useState<string | null>(null);

  // Wake Lock
  useEffect(() => {
    const acquire = async () => {
      if (!('wakeLock' in navigator)) {
        setWakeLockStatus('unsupported');
        return;
      }
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        wakeLockRef.current = sentinel;
        setWakeLockStatus('active');
        setWakeLockError(null);
        sentinel.addEventListener('release', () => {
          if (wakeLockRef.current === sentinel) setWakeLockStatus('inactive');
        });
      } catch (err) {
        setWakeLockStatus('denied');
        setWakeLockError(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
      }
    };

    acquire();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setWakeLockStatus('checking');
        acquire();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLockRef.current?.release();
    };
  }, []);

  // Ticker
  useEffect(() => {
    const id = setInterval(() => {
      setUnits(getElapsed(startTimeRef.current));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const visible = units.filter((u) => u.value > 0);
  const status = WAKE_LOCK_STATUS[wakeLockStatus];

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='rounded-box border-base-300 bg-base-200 w-full border p-4 md:max-w-md lg:max-w-lg'>
        <div className='flex flex-col items-center justify-center gap-12 py-8'>
          <p
            className='text-base-content/50 text-xs font-normal tracking-[0.35em] uppercase'
            style={{ fontFamily: "'DM Mono', monospace" }}>
            Have not slept for
          </p>

          <div className='flex flex-wrap items-end justify-center gap-x-8 gap-y-6'>
            {visible.length === 0 ? (
              <div className='flex flex-col items-center gap-1'>
                <span className='text-primary text-6xl leading-none font-normal tabular-nums md:text-8xl'>
                  00
                </span>
                <span className='text-base-content/40 text-xs font-normal tracking-[0.25em] uppercase'>
                  seconds
                </span>
              </div>
            ) : (
              visible.map((u) => (
                <div key={u.label} className='flex flex-col items-center gap-1'>
                  <span className='text-primary text-6xl leading-none font-normal tabular-nums md:text-8xl'>
                    {u.value.toString().padStart(2, '0')}
                  </span>
                  <span className='text-base-content/40 text-xs font-normal tracking-[0.25em] uppercase'>
                    {u.label}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className='bg-primary/30 h-px w-24' />

          <div className='flex flex-col items-center gap-2'>
            <span
              className={`badge ${STATUS_STYLES[wakeLockStatus].badge} gap-2`}
              role='status'
              data-status={wakeLockStatus}>
              {wakeLockStatus === 'checking' ? (
                <span className='loading loading-spinner loading-xs' />
              ) : (
                <span className='h-2 w-2 rounded-full bg-white' />
              )}
              {status.label}
            </span>
            <p className='text-base-content/50 text-xs'>{status.description}</p>
            {wakeLockError && (
              <p className='text-error text-xs' role='alert'>
                {wakeLockError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

NoSleep.displayName = 'NoSleep';
