import {
  DEFAULT_TEXT_STYLE,
  capitalize,
  cloneDeck,
  newChartObject,
  newDeck,
  newDiagramObject,
  newDrawingObject,
  newEmbedObject,
  newEquationObject,
  newIconObject,
  newImageObject,
  newMediaObject,
  newShapeObject,
  newSlide,
  newTableObject,
  newTextObject,
  slideColor,
  themeTextColor,
} from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';

describe('newDeck', () => {
  it('creates a deck with default size, theme and no slides', () => {
    const deck = newDeck();
    expect(deck.width).toBe(1800);
    expect(deck.height).toBe(1013);
    expect(deck.slides).toHaveLength(0);
    expect(deck.themeId).toBe('midnight');
    expect(deck.footer).toBeDefined();
  });

  it('merges partial deck props', () => {
    const deck = newDeck({ title: 'Custom' });
    expect(deck.title).toBe('Custom');
  });
});

describe('newSlide', () => {
  it('creates a cover slide with title, subtitle and accent bar', () => {
    const theme = themeById('midnight');
    const slide = newSlide('cover', theme, 1);
    expect(slide.layout).toBe('cover');
    expect(slide.objects.length).toBeGreaterThanOrEqual(3);
    expect(slide.transition.effect).toBe('fade');
    expect(slide.notes).toBe('');
  });

  it('creates a blank slide with no objects', () => {
    const slide = newSlide('blank', themeById('slate'), 2);
    expect(slide.objects).toHaveLength(0);
  });
});

describe('object factories', () => {
  it('newTextObject returns a text object with defaults', () => {
    const o = newTextObject();
    expect(o.kind).toBe('text');
    expect(o.w).toBe(400);
    expect(o.style).toEqual(DEFAULT_TEXT_STYLE);
  });

  it('newShapeObject returns a shape object', () => {
    const o = newShapeObject();
    expect(o.kind).toBe('shape');
    expect(o.shapeType).toBe('rect');
    expect(o.cornerRadius).toBe(12);
  });

  it('newChartObject returns a typed chart object', () => {
    const o = newChartObject();
    expect(o.kind).toBe('chart');
    expect(o.chartType).toBe('column');
    expect(o.showValues).toBe(false);
    expect(Array.isArray(o.data)).toBe(true);
  });

  it('newTableObject returns a table object', () => {
    const o = newTableObject();
    expect(o.kind).toBe('table');
    expect(o.rows).toBeGreaterThan(0);
    expect(o.cols).toBeGreaterThan(0);
  });

  it('newIconObject returns an icon object', () => {
    const o = newIconObject();
    expect(o.kind).toBe('icon');
    expect(o.icon).toBeDefined();
  });

  it('newDiagramObject returns a diagram object', () => {
    const o = newDiagramObject();
    expect(o.kind).toBe('diagram');
    expect(o.items.length).toBeGreaterThan(0);
  });

  it('newEquationObject returns an equation object', () => {
    const o = newEquationObject();
    expect(o.kind).toBe('equation');
    expect(o.latex).toBeTruthy();
  });

  it('newImageObject returns an image object', () => {
    const o = newImageObject();
    expect(o.kind).toBe('image');
    expect(o.corners).toBe(8);
    expect(o.border).toBeDefined();
  });

  it('newMediaObject returns a media object', () => {
    const o = newMediaObject();
    expect(o.kind).toBe('media');
    expect(o.autoplay).toBeDefined();
  });

  it('newEmbedObject returns an embed object', () => {
    const o = newEmbedObject();
    expect(o.kind).toBe('embed');
    expect(o.embedType).toBe('youtube');
  });

  it('newDrawingObject returns a drawing object', () => {
    const o = newDrawingObject();
    expect(o.kind).toBe('drawing');
    expect(o.strokes).toEqual([]);
  });

  it('respects partials', () => {
    expect(newTextObject({ text: 'Hi' }).text).toBe('Hi');
    expect(newShapeObject({ shapeType: 'ellipse' }).shapeType).toBe('ellipse');
  });
});

describe('theme helpers', () => {
  it('returns theme text and primary colors', () => {
    const theme = themeById('midnight');
    expect(themeTextColor(theme)).toBe(theme.colors.text);
    expect(slideColor(theme)).toBe(theme.colors.primary);
  });
});

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('')).toBe('');
  });
});

describe('cloneDeck', () => {
  it('deep-clones the deck', () => {
    const deck = newDeck({
      slides: [newSlide('cover', themeById('midnight'), 1)],
    });
    const clone = cloneDeck(deck);
    expect(clone).toEqual(deck);
    expect(clone).not.toBe(deck);
    expect(clone.slides).not.toBe(deck.slides);
    expect(clone.slides[0].objects).not.toBe(deck.slides[0].objects);
  });
});
