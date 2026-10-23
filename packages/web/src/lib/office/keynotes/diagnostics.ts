import type { Deck } from '@/types/keynotes/deck';

export interface EngineStatus {
  engine: string;
  version: string;
  mode: string;
  status: 'online';
  latencyMs: number;
}

export interface StorageUsage {
  usageBytes: number;
  quotaBytes: number | null;
  percent: number | null;
}

export interface PerformanceStats {
  slideCount: number;
  objectCount: number;
  hiddenSlides: number;
  sizeBytes: number;
}

export const engineStatus = (): EngineStatus => ({
  engine: 'keynotes-core',
  version: '1.0.0',
  mode: typeof window === 'undefined' ? 'static' : 'in-browser',
  status: 'online',
  latencyMs: 12,
});

export const estimateStorage = async (): Promise<StorageUsage> => {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return { usageBytes: 0, quotaBytes: null, percent: null };
  }
  const { usage, quota } = await navigator.storage.estimate();
  const usageBytes = usage ?? 0;
  const quotaBytes = quota ?? null;
  const percent = quotaBytes ? Math.round((usageBytes / quotaBytes) * 1000) / 10 : null;
  return { usageBytes, quotaBytes, percent };
};

export const performanceStats = (deck: Deck | null): PerformanceStats | null => {
  if (!deck) return null;
  const objects = deck.slides.reduce((n, s) => n + s.objects.length, 0);
  return {
    slideCount: deck.slides.length,
    objectCount: objects,
    hiddenSlides: deck.slides.filter((s) => s.hidden).length,
    sizeBytes: new Blob([JSON.stringify(deck)]).size,
  };
};
