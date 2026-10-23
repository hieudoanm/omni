import type {
  ChartObject,
  Deck,
  DeckTheme,
  DiagramObject,
  DrawingObject,
  EmbedObject,
  EquationObject,
  FillStyle,
  IconObject,
  ImageObject,
  MediaObject,
  Slide,
  SlideObject,
  SlideTransition,
  TableObject,
  TextObject,
  TextStyle,
  ShapeObject,
} from '@/types/keynotes/deck';
import { generateId } from '@/lib/office/keynotes/id';

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'sans',
  fontSize: 24,
  color: '#e5e9ff',
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  lineHeight: 1.4,
  letterSpacing: 0,
  align: 'left',
  bullet: false,
  numbered: false,
  vertical: 'top',
};

export const DEFAULT_FILL: FillStyle = {
  type: 'solid',
  color: '#6366f1',
  opacity: 1,
};

export const DEFAULT_TRANSITION: SlideTransition = {
  effect: 'fade',
  duration: 500,
  direction: 'forward',
};

export const newTextObject = (partial?: Partial<TextObject>): TextObject => ({
  id: generateId('txt'),
  name: 'Text',
  kind: 'text',
  x: 80,
  y: 80,
  w: 400,
  h: 120,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  text: 'Double-click to edit',
  style: { ...DEFAULT_TEXT_STYLE },
  ...partial,
});

export const newShapeObject = (partial?: Partial<ShapeObject>): ShapeObject => ({
  id: generateId('shp'),
  name: 'Shape',
  kind: 'shape',
  shapeType: 'rect',
  x: 160,
  y: 120,
  w: 200,
  h: 140,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  fill: { ...DEFAULT_FILL },
  stroke: { color: 'transparent', width: 0, dash: 'solid' },
  shadow: {
    enabled: false,
    color: '#000000',
    blur: 12,
    offsetX: 3,
    offsetY: 4,
  },
  cornerRadius: 12,
  ...partial,
});

export const themeTextColor = (theme: DeckTheme): string => theme.colors.text;

export const slideColor = (theme: DeckTheme): string => theme.colors.primary;

const layoutObjects = (layout: Slide['layout'], theme: DeckTheme): SlideObject[] => {
  const text = theme.colors.text;
  const primary = theme.colors.primary;
  const muted = theme.colors.muted;
  const base: Partial<TextStyle> = {
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize,
    color: text,
    align: 'center',
  };

  switch (layout) {
    case 'cover': {
      const title = newTextObject({
        x: 80,
        y: 200,
        w: 1640,
        h: 140,
        name: 'Title',
        text: 'Your Title Here',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          fontSize: theme.fontSize * 3,
          bold: true,
          letterSpacing: -0.5,
        },
      });
      const subtitle = newTextObject({
        x: 80,
        y: 350,
        w: 1640,
        h: 90,
        name: 'Subtitle',
        text: 'A subtitle for your presentation',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          fontSize: theme.fontSize * 1.4,
          color: muted,
        },
      });
      const accent = newShapeObject({
        x: 760,
        y: 110,
        w: 280,
        h: 18,
        name: 'Accent bar',
        shapeType: 'rounded-rect',
        fill: { type: 'solid', color: primary, opacity: 1 },
        cornerRadius: 9,
      });
      return [accent, title, subtitle];
    }
    case 'title': {
      const title = newTextObject({
        x: 80,
        y: 160,
        w: 1640,
        h: 120,
        name: 'Title',
        text: 'Slide Title',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize * 2.2,
          bold: true,
        },
      });
      const subtitle = newTextObject({
        x: 80,
        y: 290,
        w: 1640,
        h: 70,
        name: 'Subtitle',
        text: 'Add a subtitle',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize * 1.2,
          color: muted,
        },
      });
      return [title, subtitle];
    }
    case 'title-content': {
      const title = newTextObject({
        x: 80,
        y: 60,
        w: 1640,
        h: 90,
        name: 'Title',
        text: 'Slide Title',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize * 1.9,
          bold: true,
        },
      });
      const body = newTextObject({
        x: 80,
        y: 190,
        w: 1640,
        h: 560,
        name: 'Content',
        text: '• Point one\n• Point two\n• Point three',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize,
          lineHeight: 1.8,
          bullet: true,
        },
      });
      return [title, body];
    }
    case 'two-content': {
      const title = newTextObject({
        x: 80,
        y: 60,
        w: 1640,
        h: 90,
        name: 'Title',
        text: 'Slide Title',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize * 1.9,
          bold: true,
        },
      });
      const left = newTextObject({
        x: 80,
        y: 190,
        w: 790,
        h: 560,
        name: 'Left column',
        text: 'Left content',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize,
          bullet: true,
        },
      });
      const right = newTextObject({
        x: 930,
        y: 190,
        w: 790,
        h: 560,
        name: 'Right column',
        text: 'Right content',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize,
          bullet: true,
        },
      });
      return [title, left, right];
    }
    case 'section': {
      const bar = newShapeObject({
        x: 80,
        y: 300,
        w: 18,
        h: 220,
        name: 'Accent bar',
        shapeType: 'rounded-rect',
        fill: { type: 'solid', color: primary, opacity: 1 },
        cornerRadius: 9,
      });
      const title = newTextObject({
        x: 130,
        y: 320,
        w: 1590,
        h: 120,
        name: 'Section title',
        text: 'Section Title',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize * 2.4,
          bold: true,
        },
      });
      const subtitle = newTextObject({
        x: 130,
        y: 450,
        w: 1590,
        h: 70,
        name: 'Section subtitle',
        text: 'Section subtitle',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize * 1.2,
          color: muted,
        },
      });
      return [bar, title, subtitle];
    }
    case 'image': {
      const title = newTextObject({
        x: 80,
        y: 60,
        w: 1640,
        h: 90,
        name: 'Title',
        text: 'Slide Title',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize * 1.9,
          bold: true,
        },
      });
      const placeholder = newShapeObject({
        x: 80,
        y: 190,
        w: 1640,
        h: 560,
        name: 'Image placeholder',
        shapeType: 'rect',
        fill: { type: 'solid', color: theme.colors.surface, opacity: 1 },
        stroke: { color: theme.colors.muted, width: 2, dash: 'dashed' },
      });
      return [title, placeholder];
    }
    case 'quote': {
      const quote = newTextObject({
        x: 160,
        y: 220,
        w: 1480,
        h: 300,
        name: 'Quote',
        text: '“An inspiring quote goes here.”',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          fontSize: theme.fontSize * 2,
          italic: true,
          lineHeight: 1.5,
        },
      });
      const author = newTextObject({
        x: 160,
        y: 540,
        w: 1480,
        h: 70,
        name: 'Author',
        text: '— Author Name',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          fontSize: theme.fontSize,
          color: muted,
          align: 'right',
        },
      });
      return [quote, author];
    }
    case 'comparison': {
      const title = newTextObject({
        x: 80,
        y: 60,
        w: 1640,
        h: 90,
        name: 'Title',
        text: 'Slide Title',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize * 1.9,
          bold: true,
        },
      });
      const left = newTextObject({
        x: 80,
        y: 190,
        w: 790,
        h: 60,
        name: 'Left heading',
        text: 'Option A',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize * 1.3,
          bold: true,
          color: primary,
        },
      });
      const right = newTextObject({
        x: 930,
        y: 190,
        w: 790,
        h: 60,
        name: 'Right heading',
        text: 'Option B',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          align: 'left',
          fontSize: theme.fontSize * 1.3,
          bold: true,
          color: theme.colors.accent,
        },
      });
      const leftBody = newTextObject({
        x: 80,
        y: 270,
        w: 790,
        h: 480,
        name: 'Left body',
        text: 'Details…',
        style: { ...DEFAULT_TEXT_STYLE, ...base, align: 'left' },
      });
      const rightBody = newTextObject({
        x: 930,
        y: 270,
        w: 790,
        h: 480,
        name: 'Right body',
        text: 'Details…',
        style: { ...DEFAULT_TEXT_STYLE, ...base, align: 'left' },
      });
      return [title, left, right, leftBody, rightBody];
    }
    case 'thank-you': {
      const title = newTextObject({
        x: 80,
        y: 260,
        w: 1640,
        h: 140,
        name: 'Thank you',
        text: 'Thank You!',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          fontSize: theme.fontSize * 3,
          bold: true,
        },
      });
      const subtitle = newTextObject({
        x: 80,
        y: 420,
        w: 1640,
        h: 80,
        name: 'Questions',
        text: 'Questions? Let’s talk.',
        style: {
          ...DEFAULT_TEXT_STYLE,
          ...base,
          fontSize: theme.fontSize * 1.3,
          color: muted,
        },
      });
      return [title, subtitle];
    }
    case 'blank':
    default:
      return [];
  }
};

export const newSlide = (layout: Slide['layout'], theme: DeckTheme, slideNumber = 1): Slide => ({
  id: generateId('sld'),
  name: layout === 'blank' ? 'Blank slide' : `${capitalize(layout)} slide`,
  layout,
  background: { type: 'solid', color: theme.colors.background, opacity: 1 },
  objects: layoutObjects(layout, theme).map((o, i) => ({ ...o, z: i })),
  notes: '',
  transition: { ...DEFAULT_TRANSITION },
  hidden: false,
});

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

export const newDeck = (partial?: Partial<Deck>): Deck => {
  const now = Date.now();
  return {
    id: partial?.id ?? generateId('deck'),
    title: partial?.title ?? 'Untitled presentation',
    description: partial?.description ?? '',
    createdAt: partial?.createdAt ?? now,
    updatedAt: partial?.updatedAt ?? now,
    themeId: partial?.themeId ?? 'midnight',
    theme: partial?.theme ?? {
      id: 'midnight',
      name: 'Midnight',
      colors: {
        primary: '#6366f1',
        secondary: '#22d3ee',
        accent: '#f472b6',
        background: '#0b1020',
        surface: '#131a33',
        text: '#e5e9ff',
        muted: '#8a93c0',
      },
      fontFamily: 'space-grotesk',
      fontSize: 18,
    },
    width: partial?.width ?? 1800,
    height: partial?.height ?? 1013,
    slides: partial?.slides ?? [],
    master: partial?.master ?? {
      id: generateId('mst'),
      placeholders: [],
    },
    footer: partial?.footer ?? {
      showNumbers: false,
      showDate: false,
      text: '',
    },
    sections: partial?.sections ?? [],
    comments: partial?.comments ?? [],
    version: partial?.version ?? 1,
  };
};

export const cloneDeck = (deck: Deck): Deck => JSON.parse(JSON.stringify(deck)) as Deck;

export const newChartObject = (partial?: Partial<ChartObject>): ChartObject => ({
  id: generateId('obj'),
  name: 'Chart',
  kind: 'chart',
  x: 100,
  y: 100,
  w: 360,
  h: 240,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  chartType: 'column',
  data: [[30, 55, 40, 75, 60]],
  labels: ['A', 'B', 'C', 'D', 'E'],
  colors: ['#6366f1', '#22d3ee', '#f472b6', '#34d399'],
  showLegend: true,
  showValues: false,
  ...partial,
});

export const newTableObject = (partial?: Partial<TableObject>): TableObject => ({
  id: generateId('obj'),
  name: 'Table',
  kind: 'table',
  x: 100,
  y: 100,
  w: 360,
  h: 200,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  rows: 3,
  cols: 3,
  headerRow: true,
  headerFill: 'rgba(99,102,241,0.2)',
  headerColor: '#e5e9ff',
  cellFill: 'transparent',
  data: [
    ['A', 'B', 'C'],
    ['1', '2', '3'],
    ['4', '5', '6'],
  ],
  ...partial,
});

export const newIconObject = (partial?: Partial<IconObject>): IconObject => ({
  id: generateId('obj'),
  name: 'Icon',
  kind: 'icon',
  x: 100,
  y: 100,
  w: 120,
  h: 120,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  icon: 'star',
  color: '#6366f1',
  ...partial,
});

export const newDiagramObject = (partial?: Partial<DiagramObject>): DiagramObject => ({
  id: generateId('obj'),
  name: 'Diagram',
  kind: 'diagram',
  x: 100,
  y: 100,
  w: 360,
  h: 240,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  diagramType: 'process',
  items: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
  color: '#6366f1',
  ...partial,
});

export const newEquationObject = (partial?: Partial<EquationObject>): EquationObject => ({
  id: generateId('obj'),
  name: 'Equation',
  kind: 'equation',
  x: 100,
  y: 100,
  w: 360,
  h: 120,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  latex: 'E = mc²',
  color: '#e5e9ff',
  ...partial,
});

export const newImageObject = (partial?: Partial<ImageObject>): ImageObject => ({
  id: generateId('obj'),
  name: 'Image',
  kind: 'image',
  x: 100,
  y: 100,
  w: 400,
  h: 260,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  src: '',
  alt: '',
  corners: 8,
  border: { color: 'transparent', width: 0, dash: 'solid' },
  ...partial,
});

export const newMediaObject = (partial?: Partial<MediaObject>): MediaObject => ({
  id: generateId('obj'),
  name: 'Media',
  kind: 'media',
  x: 100,
  y: 100,
  w: 480,
  h: 270,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  src: '',
  mime: 'video',
  autoplay: false,
  ...partial,
});

export const newEmbedObject = (partial?: Partial<EmbedObject>): EmbedObject => ({
  id: generateId('obj'),
  name: 'Embed',
  kind: 'embed',
  x: 100,
  y: 100,
  w: 480,
  h: 270,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  embedType: 'youtube',
  url: '',
  mermaid: '',
  code: '',
  ...partial,
});

export const newDrawingObject = (partial?: Partial<DrawingObject>): DrawingObject => ({
  id: generateId('obj'),
  name: 'Drawing',
  kind: 'drawing',
  x: 100,
  y: 100,
  w: 360,
  h: 240,
  rotation: 0,
  opacity: 1,
  flipH: false,
  flipV: false,
  locked: false,
  hidden: false,
  z: 0,
  strokes: [],
  color: '#22d3ee',
  width: 4,
  ...partial,
});
