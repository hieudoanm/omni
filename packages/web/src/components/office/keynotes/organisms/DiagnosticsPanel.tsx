import { useEffect, useState, type FC } from 'react';
import {
  engineStatus,
  estimateStorage,
  performanceStats,
  type StorageUsage,
} from '@/lib/office/keynotes/diagnostics';
import type { Deck } from '@/types/keynotes/deck';

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Row: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className='border-base-200 flex items-center justify-between border-b py-2 text-sm last:border-b-0'>
    <span className='opacity-70'>{label}</span>
    <span className='font-medium'>{value}</span>
  </div>
);

export const DiagnosticsPanel: FC<{ deck: Deck | null }> = ({ deck }) => {
  const engine = engineStatus();
  const stats = performanceStats(deck);
  const [storage, setStorage] = useState<StorageUsage | null>(null);

  useEffect(() => {
    void estimateStorage().then(setStorage);
  }, []);

  return (
    <div>
      <p className='mb-2 text-sm opacity-70'>
        Mock engine and storage diagnostics — no network is used by this app.
      </p>
      <Row label='Engine' value={`${engine.engine} v${engine.version}`} />
      <Row label='Mode' value={engine.mode} />
      <Row label='Status' value={engine.status} />
      <Row label='Latency' value={`${engine.latencyMs} ms (mock)`} />
      {stats && (
        <>
          <Row label='Slides' value={String(stats.slideCount)} />
          <Row label='Objects' value={String(stats.objectCount)} />
          <Row label='Hidden slides' value={String(stats.hiddenSlides)} />
          <Row label='Deck size' value={formatBytes(stats.sizeBytes)} />
        </>
      )}
      <Row
        label='Storage used'
        value={storage ? `${formatBytes(storage.usageBytes)}` : 'Measuring…'}
      />
      {storage?.quotaBytes ? (
        <Row
          label='Quota'
          value={`${storage.percent ?? 0}% of ${formatBytes(storage.quotaBytes)}`}
        />
      ) : (
        <Row label='Quota' value='Unavailable' />
      )}
    </div>
  );
};
