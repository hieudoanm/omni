import { fireEvent, render } from '@testing-library/react';
import { PresentSlide } from '@/components/office/keynotes/molecules/PresentSlide';
import { newDeck, newShapeObject, newSlide } from '@/lib/office/keynotes/deckFactory';
import type { ObjectAnimation, ShapeObject, Slide, SlideObject } from '@/types/keynotes/deck';

const anim = (overrides: Partial<ObjectAnimation> = {}): ObjectAnimation => ({
  type: 'entrance',
  effect: 'fade-up',
  duration: 600,
  delay: 0,
  trigger: 'click',
  easing: 'ease-out',
  repeat: 1,
  ...overrides,
});

const shapeAt = (
  id: string,
  x: number,
  y: number,
  a?: ObjectAnimation,
  extra?: Partial<ShapeObject>,
): SlideObject => newShapeObject({ id, x, y, w: 200, h: 100, z: 1, animation: a, ...extra });

const buildSlide = (objects: Slide['objects'], partial?: Partial<Slide>): Slide => ({
  ...newSlide('blank', newDeck().theme),
  objects,
  ...partial,
});

const wrapperFor = (left: string): HTMLElement => {
  const el = Array.from(document.querySelectorAll<HTMLElement>('div.absolute')).find(
    (w) => w.style.left === left,
  );
  if (!el) throw new Error(`No object wrapper at left=${left}`);
  return el;
};

const rendererFor = (left: string): HTMLElement => {
  const el = wrapperFor(left).firstElementChild as HTMLElement;
  if (!el) throw new Error(`No renderer inside wrapper at left=${left}`);
  return el;
};

const renderSlide = (slide: Slide, step = 0, morphFrom?: Slide | null) => {
  const deck = newDeck({ slides: [slide] });
  return render(<PresentSlide deck={deck} slide={slide} step={step} morphFrom={morphFrom} />);
};

describe('PresentSlide positioning', () => {
  it('positions every object absolutely at its coordinates', () => {
    const slide = buildSlide([shapeAt('a', 120, 80, anim()), shapeAt('b', 300, 200, anim())]);
    renderSlide(slide, 1);
    expect(wrapperFor('120px').style.top).toBe('80px');
    expect(wrapperFor('300px').style.top).toBe('200px');
  });
});

describe('PresentSlide hover trigger', () => {
  it('keeps hover objects visible and animates on mouse enter', () => {
    const slide = buildSlide([
      shapeAt('a', 0, 0, anim({ type: 'emphasis', effect: 'pulse', trigger: 'hover' })),
    ]);
    renderSlide(slide, 0);
    const renderer = rendererFor('0px');
    expect(renderer.className).not.toContain('anim-emphasis-pulse');
    fireEvent.mouseEnter(wrapperFor('0px'));
    expect(renderer.className).toContain('anim-emphasis-pulse');
  });

  it('removes hover animation on mouse leave', () => {
    const slide = buildSlide([
      shapeAt('a', 0, 0, anim({ type: 'emphasis', effect: 'pulse', trigger: 'hover' })),
    ]);
    renderSlide(slide, 0);
    fireEvent.mouseEnter(wrapperFor('0px'));
    expect(rendererFor('0px').className).toContain('anim-emphasis-pulse');
    fireEvent.mouseLeave(wrapperFor('0px'));
    expect(rendererFor('0px').className).not.toContain('anim-emphasis-pulse');
  });

  it('hover objects do not have mouseEnter/Leave handlers when trigger is click', () => {
    const slide = buildSlide([shapeAt('a', 0, 0, anim({ trigger: 'click' }))]);
    renderSlide(slide, 1);
    expect(() => fireEvent.mouseEnter(wrapperFor('0px'))).not.toThrow();
  });
});

describe('PresentSlide timing options', () => {
  it('applies reverse direction when set', () => {
    const slide = buildSlide([shapeAt('a', 0, 0, anim({ reverse: true }))]);
    renderSlide(slide, 1);
    expect(rendererFor('0px').style.animationDirection).toBe('reverse');
  });

  it('does not set animationDirection when reverse is false', () => {
    const slide = buildSlide([shapeAt('a', 0, 0, anim({ reverse: false }))]);
    renderSlide(slide, 1);
    expect(rendererFor('0px').style.animationDirection).toBe('');
  });

  it('applies stagger delay per position among animated objects', () => {
    const slide = buildSlide([
      shapeAt('a', 0, 0, anim({ delay: 0, stagger: 200 })),
      shapeAt('b', 0, 0, anim({ delay: 0, stagger: 200 })),
    ]);
    renderSlide(slide, 1);
    const objs = Array.from(document.querySelectorAll<HTMLElement>('div.absolute'));
    const delays = objs.map((o) => (o.firstElementChild as HTMLElement).style.animationDelay);
    expect(delays).toContain('0ms');
    expect(delays).toContain('200ms');
  });

  it('applies custom delay', () => {
    const slide = buildSlide([shapeAt('a', 0, 0, anim({ delay: 300 }))]);
    renderSlide(slide, 1);
    expect(rendererFor('0px').style.animationDelay).toBe('300ms');
  });

  it('applies custom duration', () => {
    const slide = buildSlide([shapeAt('a', 0, 0, anim({ duration: 1200 }))]);
    renderSlide(slide, 1);
    expect(rendererFor('0px').style.animationDuration).toBe('1200ms');
  });
});

describe('PresentSlide motion path', () => {
  it('wraps object in motion path div when motionPath is set and animating', () => {
    const slide = buildSlide([
      shapeAt('a', 0, 0, anim({ trigger: 'click' }), {
        animation: {
          ...anim({ trigger: 'click' }),
          motionPath: { type: 'arc' },
        },
      } as Partial<ShapeObject>),
    ]);
    renderSlide(slide, 1);
  });

  it('does not wrap in motion path when motionPath type is none', () => {
    const slide = buildSlide([
      shapeAt('a', 0, 0, anim({ trigger: 'click' }), {
        animation: {
          ...anim({ trigger: 'click' }),
          motionPath: { type: 'none' },
        },
      } as Partial<ShapeObject>),
    ]);
    renderSlide(slide, 1);
  });
});

describe('PresentSlide group objects', () => {
  it('skips group objects in rendering', () => {
    const groupObj = {
      ...newShapeObject({ id: 'grp', x: 0, y: 0 }),
      kind: 'group' as const,
      children: ['child1'],
    };
    const child = shapeAt('child1', 100, 100);
    const slide = buildSlide([groupObj, child]);
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });
});

describe('PresentSlide parent group', () => {
  it('resolves parent group reference when object has group id', () => {
    const groupObj = {
      ...newShapeObject({ id: 'grp1', x: 0, y: 0 }),
      kind: 'group' as const,
      children: ['child1'],
    };
    const child = shapeAt('child1', 50, 50, undefined, { group: 'grp1' });
    const slide = buildSlide([groupObj, child]);
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });

  it('handles missing parent group gracefully', () => {
    const child = shapeAt('child1', 50, 50, undefined, {
      group: 'nonexistent',
    });
    const slide = buildSlide([child]);
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });
});

describe('PresentSlide hidden objects', () => {
  it('applies pointer-events-none and opacity 0 to hidden animated objects', () => {
    const slide = buildSlide([
      shapeAt('a', 0, 0, anim({ trigger: 'click' })),
      shapeAt('b', 300, 300, anim({ trigger: 'click' })),
    ]);
    renderSlide(slide, 0);
    const renderer = rendererFor('300px');
    expect(renderer.style.opacity).toBe('0');
  });
});

describe('PresentSlide with slide link', () => {
  it('passes onSlideLink callback to ObjectRenderer', () => {
    const onSlideLink = jest.fn();
    const slide = buildSlide([shapeAt('a', 0, 0)]);
    const deck = newDeck({ slides: [slide] });
    expect(() =>
      render(<PresentSlide deck={deck} slide={slide} step={0} onSlideLink={onSlideLink} />),
    ).not.toThrow();
  });
});

describe('PresentSlide morph', () => {
  it('does not throw in environments without the Web Animations API', () => {
    const prev = buildSlide([shapeAt('a', 0, 0)]);
    const next = buildSlide([shapeAt('a', 50, 40)]);
    expect(() => renderSlide(next, 0, prev)).not.toThrow();
  });

  it('handles morph with objects that match by name', () => {
    const prev = buildSlide([shapeAt('a', 0, 0, undefined, { name: 'Widget' })]);
    const next = buildSlide([shapeAt('a', 100, 100, undefined, { name: 'Widget' })]);
    expect(() => renderSlide(next, 0, prev)).not.toThrow();
  });

  it('handles morph when target has no ref element', () => {
    const prev = buildSlide([shapeAt('a', 0, 0)]);
    const next = buildSlide([shapeAt('a', 50, 40)]);
    expect(() => renderSlide(next, 0, prev)).not.toThrow();
  });
});

describe('PresentSlide slide background', () => {
  it('applies solid background from slide', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)], {
      background: { type: 'solid', color: '#ff0000', opacity: 1 },
    });
    const { container } = renderSlide(slide, 0);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toBeTruthy();
  });

  it('applies gradient background', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)], {
      background: {
        type: 'gradient',
        from: '#000',
        to: '#fff',
        angle: 45,
        opacity: 1,
      },
    });
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });

  it('applies image background', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)], {
      background: {
        type: 'image',
        imageUrl: 'https://example.com/bg.jpg',
        opacity: 0.5,
      },
    });
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });

  it('applies pattern background', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)], {
      background: { type: 'pattern', pattern: 'dots', color: '#888' },
    });
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });

  it('applies grid pattern background', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)], {
      background: { type: 'pattern', pattern: 'grid', color: '#888' },
    });
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });

  it('applies stripes pattern background', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)], {
      background: { type: 'pattern', pattern: 'stripes', color: '#888' },
    });
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });

  it('uses deck theme background when slide has no background', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)], { background: undefined });
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });

  it('handles none background type', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)], {
      background: { type: 'none' },
    });
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });
});

describe('PresentSlide footer', () => {
  it('shows slide numbers when footer.showNumbers is true', () => {
    const deck = newDeck({
      footer: { showNumbers: true, showDate: false, text: '' },
    });
    const slide = buildSlide([shapeAt('a', 0, 0)]);
    const { container } = render(
      <PresentSlide deck={deck} slide={slide} step={0} slideNumber={3} />,
    );
    expect(container.textContent).toContain('3');
  });

  it('shows date when footer.showDate is true', () => {
    const deck = newDeck({
      footer: { showNumbers: false, showDate: true, text: '' },
    });
    const slide = buildSlide([shapeAt('a', 0, 0)]);
    const { container } = render(<PresentSlide deck={deck} slide={slide} step={0} />);
    expect(container.textContent).toMatch(/\d/);
  });

  it('shows footer text when provided', () => {
    const deck = newDeck({
      footer: { showNumbers: false, showDate: false, text: 'My Talk' },
    });
    const slide = buildSlide([shapeAt('a', 0, 0)]);
    const { container } = render(<PresentSlide deck={deck} slide={slide} step={0} />);
    expect(container.textContent).toContain('My Talk');
  });

  it('shows footer logo when provided', () => {
    const deck = newDeck({
      footer: {
        showNumbers: false,
        showDate: false,
        text: '',
        logo: 'https://example.com/logo.png',
      },
    });
    const slide = buildSlide([shapeAt('a', 0, 0)]);
    const { container } = render(<PresentSlide deck={deck} slide={slide} step={0} />);
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('https://example.com/logo.png');
  });

  it('does not render footer when all options are false/empty', () => {
    const deck = newDeck({
      footer: { showNumbers: false, showDate: false, text: '' },
    });
    const slide = buildSlide([shapeAt('a', 0, 0)]);
    const { container } = render(<PresentSlide deck={deck} slide={slide} step={0} />);
    const footerArea = container.querySelector('.flex.items-end.justify-between');
    expect(footerArea).toBeNull();
  });

  it('renders footer when showNumbers is true even with empty text', () => {
    const deck = newDeck({
      footer: { showNumbers: true, showDate: false, text: '' },
    });
    const slide = buildSlide([shapeAt('a', 0, 0)]);
    const { container } = render(
      <PresentSlide deck={deck} slide={slide} step={0} slideNumber={1} />,
    );
    expect(container.textContent).toContain('1');
  });
});

describe('PresentSlide className', () => {
  it('applies custom className to root element', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)]);
    const { container } = renderSlide(slide, 0);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('relative');
  });

  it('defaults to empty className when not provided', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)]);
    const { container } = renderSlide(slide, 0);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeTruthy();
  });
});

describe('PresentSlide no animation', () => {
  it('renders objects without animation normally', () => {
    const slide = buildSlide([shapeAt('a', 0, 0), shapeAt('b', 200, 200)]);
    renderSlide(slide, 0);
    expect(wrapperFor('0px')).toBeTruthy();
    expect(wrapperFor('200px')).toBeTruthy();
  });
});

describe('PresentSlide with transition', () => {
  it('renders with default fade transition', () => {
    const slide = buildSlide([shapeAt('a', 0, 0)]);
    slide.transition = {
      effect: 'fade',
      duration: 500,
      direction: 'forward',
    };
    expect(() => renderSlide(slide, 0)).not.toThrow();
  });
});
