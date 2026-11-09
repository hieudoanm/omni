import type { Deck, DeckTheme, Slide, SlideObject } from '@/types/keynotes/deck';
import {
  DEFAULT_TEXT_STYLE,
  newDeck,
  newImageObject,
  newShapeObject,
  newSlide,
  newTextObject,
} from '@/lib/office/keynotes/deckFactory';
import { parseDeckJson } from '@/lib/office/keynotes/exporters';

export interface MockSlideSpec {
  layout?: Slide['layout'];
  title?: string;
  subtitle?: string;
  content?: string[];
  imageUrl?: string;
  shape?: 'rect' | 'ellipse' | 'arrow-right' | 'diamond';
}

interface PptxMockFile {
  format?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  slides?: MockSlideSpec[];
}

const mockLatency = (): Promise<void> => {
  const delay = process.env.NEXT_PUBLIC_MOCK_DELAY;
  const ms = delay ? parseInt(delay, 10) : 600;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const textObject = (
  spec: MockSlideSpec,
  width: number,
  height: number,
  theme: DeckTheme,
  z: number,
): SlideObject | null => {
  const text = spec.title || spec.subtitle;
  if (!text) return null;
  const isTitle = Boolean(spec.title);
  return newTextObject({
    name: isTitle ? 'Title' : 'Subtitle',
    text,
    z,
    x: width * 0.1,
    y: isTitle ? height * 0.06 : height * 0.18,
    w: width * 0.8,
    h: height * (isTitle ? 0.1 : 0.06),
    style: {
      ...DEFAULT_TEXT_STYLE,
      fontFamily: theme.fontFamily,
      fontSize: isTitle ? 52 : 28,
      color: isTitle ? theme.colors.text : theme.colors.muted,
      bold: isTitle,
    },
  });
};

const contentObject = (
  content: string[],
  width: number,
  height: number,
  theme: DeckTheme,
  z: number,
): SlideObject | null => {
  if (!content.length) return null;
  return newTextObject({
    name: 'Content',
    text: content.map((b) => `• ${b}`).join('\n'),
    z,
    x: width * 0.1,
    y: height * 0.28,
    w: width * 0.72,
    h: height * 0.5,
    style: {
      ...DEFAULT_TEXT_STYLE,
      fontFamily: theme.fontFamily,
      fontSize: 26,
      color: theme.colors.text,
    },
  });
};

const imageObject = (
  imageUrl: string,
  width: number,
  height: number,
  z: number,
): SlideObject | null =>
  newImageObject({
    name: 'Image',
    src: imageUrl,
    z,
    x: width * 0.6,
    y: height * 0.3,
    w: width * 0.32,
    h: height * 0.42,
    corners: 12,
  });

const shapeObject = (
  shape: NonNullable<MockSlideSpec['shape']>,
  width: number,
  height: number,
  z: number,
): SlideObject | null =>
  newShapeObject({
    name: 'Shape',
    shapeType: shape,
    z,
    x: width * 0.62,
    y: height * 0.34,
    w: width * 0.3,
    h: height * 0.3,
    fill: { type: 'solid', color: '#6366f1', opacity: 0.9 },
  });

const slideFromSpec = (spec: MockSlideSpec, width: number, height: number): Slide => {
  const theme = newDeck().theme;
  const slide = newSlide(spec.layout ?? 'blank', theme);
  slide.name = spec.title ? `Slide — ${spec.title}` : slide.name;
  const parts: Array<SlideObject | null> = [
    textObject(spec, width, height, theme, 0),
    contentObject(spec.content ?? [], width, height, theme, 1),
    spec.imageUrl ? imageObject(spec.imageUrl, width, height, 2) : null,
    spec.shape ? shapeObject(spec.shape, width, height, 3) : null,
  ];
  slide.objects = parts.filter((p): p is SlideObject => p !== null);
  return slide;
};

export const parsePptxMock = (text: string): Deck => {
  let data: PptxMockFile;
  try {
    data = JSON.parse(text) as PptxMockFile;
  } catch {
    throw new Error('Not a valid PPTX mock file');
  }
  if (!data || !Array.isArray(data.slides)) {
    throw new Error('Not a valid PPTX mock file');
  }
  const deck = newDeck({
    title: data.title ?? 'Imported from PPTX',
    description: data.description ?? '',
    width: data.width,
    height: data.height,
  });
  deck.slides = data.slides.map((s) => slideFromSpec(s, deck.width, deck.height));
  return deck;
};

export const parseImportText = (text: string): Deck => {
  try {
    return parseDeckJson(text);
  } catch {
    return parsePptxMock(text);
  }
};

const extractSlideId = (url: string): string => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Please paste a valid Google Slides URL');
  }
  if (!/docs\.google\.com/.test(parsed.hostname)) {
    throw new Error('Not a Google Slides URL');
  }
  const parts = parsed.pathname.split('/');
  const idx = parts.indexOf('presentation');
  return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : parts[parts.length - 1] || 'deck';
};

export const parseGoogleSlidesDeck = (slideId: string): Deck => {
  const deck = newDeck({
    title: 'Imported from Google Slides',
    description: 'Fetched from a public Google Slides deck (mock).',
  });
  deck.slides = [
    slideFromSpec(
      { title: 'Imported deck', subtitle: `Source: ${slideId}` },
      deck.width,
      deck.height,
    ),
    slideFromSpec(
      {
        title: 'Slide 2',
        content: ['Content pulled from the deck', 'Images and shapes approximated'],
      },
      deck.width,
      deck.height,
    ),
    slideFromSpec({ title: 'Thanks!', subtitle: 'Questions welcome' }, deck.width, deck.height),
  ];
  return deck;
};

export const fetchGoogleSlidesMock = async (url: string): Promise<Deck> => {
  await mockLatency();
  return parseGoogleSlidesDeck(extractSlideId(url));
};
