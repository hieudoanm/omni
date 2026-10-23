import { slideBackgroundCss } from '@/lib/office/keynotes/slideBg';

describe('slideBackgroundCss', () => {
  it('falls back to the deck background when bg is undefined', () => {
    expect(slideBackgroundCss(undefined, '#0b1020')).toEqual({
      backgroundColor: '#0b1020',
    });
  });

  it('falls back when the background type is none', () => {
    expect(slideBackgroundCss({ type: 'none' }, '#fff')).toEqual({
      backgroundColor: '#fff',
    });
  });

  it('maps a solid color to a background color', () => {
    expect(slideBackgroundCss({ type: 'solid', color: '#ff0000', opacity: 1 }, '#000')).toEqual({
      backgroundColor: '#ff0000',
      opacity: 1,
    });
  });

  it('builds a linear gradient from from/to colors', () => {
    const css = slideBackgroundCss(
      { type: 'gradient', from: '#f00', to: '#00f', angle: 45, opacity: 0.5 },
      '#000',
    );
    expect(css.backgroundImage).toBe('linear-gradient(45deg, #f00 0%, #00f 100%)');
    expect(css.opacity).toBe(0.5);
  });

  it('uses explicit gradient stops when provided', () => {
    const css = slideBackgroundCss(
      {
        type: 'gradient',
        from: '#f00',
        to: '#00f',
        angle: 90,
        opacity: 1,
        stops: [
          { color: '#111', offset: 0 },
          { color: '#222', offset: 0.5 },
          { color: '#333', offset: 1 },
        ],
      },
      '#000',
    );
    expect(css.backgroundImage).toBe('linear-gradient(90deg, #111 0%, #222 50%, #333 100%)');
  });

  it('covers the slide with an image background', () => {
    const css = slideBackgroundCss(
      { type: 'image', imageUrl: 'https://example.com/bg.png', opacity: 1 },
      '#000',
    );
    expect(css.backgroundImage).toBe('url("https://example.com/bg.png")');
    expect(css.backgroundSize).toBe('cover');
    expect(css.backgroundPosition).toBe('center');
  });

  it('renders pattern backgrounds from the pattern color', () => {
    const css = slideBackgroundCss({ type: 'pattern', pattern: 'dots', color: '#fff' }, '#000');
    expect(css.backgroundImage).toContain('radial-gradient');
    expect(css.backgroundSize).toBe('12px 12px');
  });
});
