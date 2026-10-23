export interface TimeUnit {
  value: number;
  label: string;
}

export type WakeLockStatus = 'checking' | 'active' | 'inactive' | 'unsupported' | 'denied';

interface WakeLockStatusMeta {
  label: string;
  description: string;
}

export const WAKE_LOCK_STATUS: Record<WakeLockStatus, WakeLockStatusMeta> = {
  checking: {
    label: 'Requesting',
    description: 'Requesting the wake lock…',
  },
  active: {
    label: 'Active',
    description: 'The screen is being kept awake.',
  },
  inactive: {
    label: 'Released',
    description: 'The wake lock was released — likely because the tab was hidden.',
  },
  unsupported: {
    label: 'Unsupported',
    description: 'The Wake Lock API is not available in this browser.',
  },
  denied: {
    label: 'Denied',
    description: 'The wake lock request was denied — the screen may sleep.',
  },
};

export const getElapsed = (startTime: number): TimeUnit[] => {
  let totalSeconds = Math.floor((Date.now() - startTime) / 1000);

  const years = Math.floor(totalSeconds / (365 * 24 * 3600));
  totalSeconds -= years * 365 * 24 * 3600;

  const months = Math.floor(totalSeconds / (30 * 24 * 3600));
  totalSeconds -= months * 30 * 24 * 3600;

  const days = Math.floor(totalSeconds / (24 * 3600));
  totalSeconds -= days * 24 * 3600;

  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds -= hours * 3600;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;

  return [
    { value: years, label: years === 1 ? 'year' : 'years' },
    { value: months, label: months === 1 ? 'month' : 'months' },
    { value: days, label: days === 1 ? 'day' : 'days' },
    { value: hours, label: hours === 1 ? 'hour' : 'hours' },
    { value: minutes, label: minutes === 1 ? 'minute' : 'minutes' },
    { value: seconds, label: seconds === 1 ? 'second' : 'seconds' },
  ];
};
