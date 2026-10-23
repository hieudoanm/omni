import type { ShapeType } from '@/types/keynotes/deck';

export const SHAPE_TYPES: ShapeType[] = [
  'rect',
  'rounded-rect',
  'ellipse',
  'triangle',
  'diamond',
  'trapezoid',
  'parallelogram',
  'pentagon',
  'hexagon',
  'octagon',
  'star',
  'arrow-right',
  'arrow-left',
  'arrow-up',
  'arrow-down',
  'double-arrow',
  'chevron',
  'pentagon-arrow',
  'callout',
  'line',
  'curve',
  'heart',
  'cross',
  'plus',
  'quarter-circle',
  'half-circle',
  'semicircle',
  'sun',
  'cloud',
  'bolt',
  'hexagon-stacked',
];

export const shapePath = (type: ShapeType): string => {
  switch (type) {
    case 'rect':
      return 'M0 0 H100 V100 H0 Z';
    case 'rounded-rect':
      return 'M15 0 H85 C91.63 0 100 8.37 100 15 V85 C100 91.63 91.63 100 85 100 H15 C8.37 100 0 91.63 0 85 V15 C0 8.37 8.37 0 15 0 Z';
    case 'ellipse':
      return 'M50 0 A50 50 0 1 1 49.99 0 Z';
    case 'triangle':
      return 'M50 0 L100 100 L0 100 Z';
    case 'diamond':
      return 'M50 0 L100 50 L50 100 L0 50 Z';
    case 'trapezoid':
      return 'M25 0 H100 L75 100 H0 Z';
    case 'parallelogram':
      return 'M30 0 H100 L70 100 H0 Z';
    case 'pentagon':
      return 'M50 0 L100 38 L81 100 L19 100 L0 38 Z';
    case 'hexagon':
      return 'M50 0 L93 25 V75 L50 100 L7 75 V25 Z';
    case 'octagon':
      return 'M29 0 H71 L100 29 V71 L71 100 H29 L0 71 V29 Z';
    case 'star':
      return 'M50 0 L62 35 L98 36 L70 58 L79 95 L50 74 L21 95 L30 58 L2 36 L38 35 Z';
    case 'arrow-right':
      return 'M0 40 H70 V20 L100 50 L70 80 V60 H0 Z';
    case 'arrow-left':
      return 'M100 40 H30 V20 L0 50 L30 80 V60 H100 Z';
    case 'arrow-up':
      return 'M60 0 H40 V70 H20 L50 100 L80 70 H60 Z';
    case 'arrow-down':
      return 'M40 100 H60 V30 H80 L50 0 L20 30 H40 Z';
    case 'double-arrow':
      return 'M0 40 H50 V20 L100 50 L50 80 V60 H0 Z';
    case 'chevron':
      return 'M0 0 L70 0 L100 50 L70 100 L0 100 L30 50 Z';
    case 'pentagon-arrow':
      return 'M0 40 H60 V20 L100 50 L60 80 V60 H0 Z';
    case 'callout':
      return 'M0 0 H100 V75 H30 L15 95 L20 75 H0 Z';
    case 'line':
      return 'M0 50 H100';
    case 'curve':
      return 'M0 90 C20 90 30 10 50 10 S80 90 100 90';
    case 'heart':
      return 'M50 90 C20 65 0 45 0 25 C0 8 18 0 30 8 C40 14 47 20 50 28 C53 20 60 14 70 8 C82 0 100 8 100 25 C100 45 80 65 50 90 Z';
    case 'cross':
      return 'M35 0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z';
    case 'plus':
      return 'M40 0 H60 V40 H100 V60 H60 V100 H40 V60 H0 V40 H40 Z';
    case 'quarter-circle':
      return 'M0 0 H100 V100 C44 100 0 56 0 0 Z';
    case 'half-circle':
      return 'M0 0 H100 V50 A50 50 0 0 1 0 50 Z';
    case 'semicircle':
      return 'M0 100 A50 50 0 1 1 100 100 Z';
    case 'sun':
      return 'M50 35 A15 15 0 1 1 49.99 35 Z M50 10 V0 M50 100 V90 M10 50 H0 M100 50 H90 M22 22 L15 15 M85 85 L78 78 M78 22 L85 15 M22 78 L15 85';
    case 'cloud':
      return 'M60 30 A20 20 0 0 1 95 40 A18 18 0 0 1 88 75 H25 A20 20 0 0 1 15 40 A24 24 0 0 1 60 30 Z';
    case 'bolt':
      return 'M55 0 L10 55 H40 L30 100 L90 40 H60 Z';
    case 'hexagon-stacked':
      return 'M50 0 L93 25 V75 L50 100 L7 75 V25 Z M50 15 L82 33 V69 L50 87 L18 69 V33 Z';
    default:
      return 'M0 0 H100 V100 H0 Z';
  }
};

export const shapeLabel = (type: ShapeType): string =>
  type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
