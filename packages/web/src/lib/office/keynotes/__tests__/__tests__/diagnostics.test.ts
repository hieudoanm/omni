import { engineStatus, estimateStorage, performanceStats } from '@/lib/office/keynotes/diagnostics';
import { newDeck, newSlide, newTextObject } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';

describe('diagnostics', () => {
  it('reports a healthy mock engine status', () => {
    const status = engineStatus();
    expect(status.engine).toBe('keynotes-core');
    expect(status.status).toBe('online');
    expect(status.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('estimates storage usage via navigator.storage', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: {
        estimate: () => Promise.resolve({ usage: 2048, quota: 1024 * 1024 }),
      },
    });
    const usage = await estimateStorage();
    expect(usage.usageBytes).toBe(2048);
    expect(usage.percent).toBe(0.2);
  });

  it('counts slides, objects and deck size', () => {
    const deck = newDeck({
      title: 'Stats',
      slides: [
        newSlide('cover', themeById('midnight'), 1),
        newSlide('title', themeById('midnight'), 2),
      ],
    });
    deck.slides[0].objects.push(newTextObject({ text: 'Extra' }));
    deck.slides[1].hidden = true;
    const stats = performanceStats(deck);
    expect(stats).toEqual(
      expect.objectContaining({
        slideCount: 2,
        hiddenSlides: 1,
        objectCount: deck.slides.reduce((n, s) => n + s.objects.length, 0),
      }),
    );
    expect(stats?.sizeBytes).toBeGreaterThan(0);
  });

  it('returns null stats for a null deck', () => {
    expect(performanceStats(null)).toBeNull();
  });
});
