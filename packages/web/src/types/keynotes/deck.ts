export type ShapeType =
  | 'rect'
  | 'rounded-rect'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'trapezoid'
  | 'parallelogram'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'star'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'double-arrow'
  | 'chevron'
  | 'pentagon-arrow'
  | 'callout'
  | 'line'
  | 'curve'
  | 'heart'
  | 'cross'
  | 'plus'
  | 'quarter-circle'
  | 'half-circle'
  | 'semicircle'
  | 'sun'
  | 'cloud'
  | 'bolt'
  | 'hexagon-stacked';

export type FillStyle =
  | { type: 'none' }
  | { type: 'solid'; color: string; opacity: number }
  | {
      type: 'gradient';
      from: string;
      to: string;
      angle: number;
      opacity: number;
      stops?: Array<{ color: string; offset: number }>;
    }
  | { type: 'image'; imageUrl: string; opacity: number }
  | { type: 'pattern'; pattern: 'dots' | 'grid' | 'stripes'; color: string };

export type StrokeStyle = {
  color: string;
  width: number;
  dash: 'solid' | 'dashed' | 'dotted';
  arrowStart?: boolean;
  arrowEnd?: boolean;
};

export type ShadowStyle = {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
};

export type ShapeEffect = {
  glowColor?: string;
  glowBlur?: number;
  reflection?: boolean;
  softEdges?: number;
  bevel?: boolean;
};

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export type FontFamily = 'sans' | 'serif' | 'mono' | 'playfair' | 'space-grotesk';

export type TextStyle = {
  fontFamily: FontFamily;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  lineHeight: number;
  letterSpacing: number;
  align: TextAlign;
  bullet: boolean;
  numbered: boolean;
  highlight?: string;
  script?: 'none' | 'sub' | 'sup';
  columns?: number;
  columnGap?: number;
  transform?: 'none' | 'tilt' | 'wave' | 'arc' | 'rotate-cw' | 'rotate-ccw';
  vertical: 'top' | 'middle' | 'bottom';
};

export type AnimationEffectType = 'entrance' | 'emphasis' | 'exit';
export type AnimationTrigger = 'click' | 'with' | 'after' | 'hover';

export type MotionPath =
  { type: 'none' } | { type: 'arc' | 'loop' | 'star' } | { type: 'custom'; path: string };

export type AnimationEffect =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom'
  | 'zoom-in'
  | 'zoom-out'
  | 'fly-up'
  | 'fly-down'
  | 'fly-left'
  | 'fly-right'
  | 'wipe-up'
  | 'wipe-down'
  | 'wipe-left'
  | 'wipe-right'
  | 'bounce'
  | 'pulse'
  | 'spin'
  | 'grow'
  | 'shake'
  | 'blink'
  | 'wobble'
  | 'color-change'
  | 'flip'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right';

export type ObjectAnimation = {
  type: AnimationEffectType;
  effect: AnimationEffect;
  duration: number;
  delay: number;
  trigger: AnimationTrigger;
  easing: string;
  repeat: number;
  reverse?: boolean;
  stagger?: number;
  motionPath?: MotionPath;
};

export type TransitionEffect =
  | 'none'
  | 'fade'
  | 'push'
  | 'wipe'
  | 'cover'
  | 'reveal'
  | 'zoom'
  | 'split'
  | 'flip'
  | 'cube'
  | 'doors'
  | 'morph';

export type SlideTransition = {
  effect: TransitionEffect;
  duration: number;
  direction: 'left' | 'right' | 'up' | 'down' | 'forward' | 'backward';
  bounciness?: number;
};

export type ChartType = 'bar' | 'column' | 'line' | 'area' | 'pie' | 'doughnut' | 'scatter';

export type DiagramType = 'process' | 'cycle' | 'hierarchy' | 'matrix' | 'pyramid';

export type EmbedType = 'youtube' | 'mermaid' | 'code';

export type SlideLayoutId =
  | 'cover'
  | 'title'
  | 'title-content'
  | 'two-content'
  | 'section'
  | 'image'
  | 'quote'
  | 'comparison'
  | 'thank-you'
  | 'blank';

export type Point = { x: number; y: number };

export type Hyperlink = {
  type: 'url' | 'email' | 'slide';
  url?: string;
  email?: string;
  slideId?: string;
};

interface BaseObject {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  opacity: number;
  flipH: boolean;
  flipV: boolean;
  locked: boolean;
  hidden: boolean;
  z: number;
  animation?: ObjectAnimation | null;
  aspectLock?: boolean;
  group?: string;
  link?: Hyperlink;
}

export type TextObject = BaseObject & {
  kind: 'text';
  text: string;
  style: TextStyle;
  fill?: FillStyle;
};

export type ShapeObject = BaseObject & {
  kind: 'shape';
  shapeType: ShapeType;
  fill: FillStyle;
  stroke: StrokeStyle;
  shadow: ShadowStyle;
  effect?: ShapeEffect;
  text?: string;
  style?: TextStyle;
  cornerRadius: number;
};

export type ImageObject = BaseObject & {
  kind: 'image';
  src: string;
  alt: string;
  corners: number;
  border?: StrokeStyle;
};

export type ChartObject = BaseObject & {
  kind: 'chart';
  chartType: ChartType;
  labels: string[];
  data: number[][];
  colors: string[];
  showLegend: boolean;
  showValues: boolean;
};

export type TableObject = BaseObject & {
  kind: 'table';
  rows: number;
  cols: number;
  data: string[][];
  headerRow: boolean;
  cellFill: string;
  headerFill: string;
  headerColor: string;
};

export type MediaObject = BaseObject & {
  kind: 'media';
  src: string;
  mime: 'video' | 'audio';
  autoplay: boolean;
};

export type DiagramObject = BaseObject & {
  kind: 'diagram';
  diagramType: DiagramType;
  items: string[];
  color: string;
};

export type IconObject = BaseObject & {
  kind: 'icon';
  icon: string;
  color: string;
};

export type EquationObject = BaseObject & {
  kind: 'equation';
  latex: string;
  color: string;
};

export type DrawingObject = BaseObject & {
  kind: 'drawing';
  strokes: Point[][];
  color: string;
  width: number;
};

export type EmbedObject = BaseObject & {
  kind: 'embed';
  embedType: EmbedType;
  url?: string;
  code?: string;
  language?: string;
  mermaid?: string;
};

export type GroupObject = BaseObject & {
  kind: 'group';
  children: string[];
};

export type SlideObject =
  | TextObject
  | ShapeObject
  | ImageObject
  | ChartObject
  | TableObject
  | MediaObject
  | DiagramObject
  | IconObject
  | EquationObject
  | DrawingObject
  | EmbedObject
  | GroupObject;

export type ObjectKind = SlideObject['kind'];

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
};

export type DeckTheme = {
  id: string;
  name: string;
  colors: ThemeColors;
  fontFamily: FontFamily;
  fontSize: number;
  variants?: Array<{
    id: string;
    name: string;
    background: string;
    surface: string;
    text?: string;
    muted?: string;
  }>;
};

export type SlideBackground = FillStyle;

export interface Slide {
  id: string;
  name: string;
  layout: SlideLayoutId;
  background: SlideBackground;
  objects: SlideObject[];
  notes: string;
  transition: SlideTransition;
  hidden: boolean;
  autoAdvance?: number;
}

export interface DeckSection {
  id: string;
  title: string;
  slideIds: string[];
}

export interface DeckFooter {
  showNumbers: boolean;
  showDate: boolean;
  text: string;
  logo?: string;
}

export interface SlideMaster {
  id: string;
  placeholders: Array<{
    id: string;
    kind: 'title' | 'subtitle' | 'content' | 'footer';
    x: number;
    y: number;
    w: number;
    h: number;
    style?: Partial<TextStyle>;
  }>;
}

export interface CommentReply {
  id: string;
  author: string;
  text: string;
  createdAt: number;
}

export interface SlideComment {
  id: string;
  slideId: string;
  objectId?: string;
  author: string;
  text: string;
  resolved: boolean;
  createdAt: number;
  replies: CommentReply[];
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  themeId: string;
  theme: DeckTheme;
  width: number;
  height: number;
  slides: Slide[];
  master: SlideMaster;
  footer: DeckFooter;
  sections: DeckSection[];
  comments: SlideComment[];
  version: number;
}

export interface DeckSummary {
  id: string;
  title: string;
  description: string;
  updatedAt: number;
  createdAt: number;
  slideCount: number;
  themeId: string;
}

export interface DeckSnapshot {
  id: string;
  deckId: string;
  deck: Deck;
  label: string;
  createdAt: number;
}

export interface AppSettings {
  id: string;
  theme: 'dark' | 'light';
  defaultSlideSize: '16-9' | '4-3' | 'custom';
  defaultTheme: string;
  autosave: boolean;
}

export interface QaQuestion {
  id: string;
  text: string;
  author: string;
  upvotes: number;
  answered: boolean;
  createdAt: number;
}

export type ObjectAnimationState = 'idle' | 'entering' | 'active' | 'exiting';

export const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  sans: "'Inter', system-ui, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
  playfair: "'Playfair Display', Georgia, serif",
  'space-grotesk': "'Space Grotesk', system-ui, sans-serif",
};
