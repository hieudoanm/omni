import {
  exportDeckJson,
  exportDeckPngs,
  exportDeckStoryPng,
  exportDeckStorySvg,
  exportHtml,
  exportHtmlFile,
  exportPptxMock,
  exportSlidePng,
  exportSlideSvg,
  exportThemeFile,
  parseDeckJson,
  serializeDeckJson,
  serializeThemeFile,
  slideStorySvg,
  slideToSvg,
} from '@/lib/office/keynotes/exporters';
import {
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
} from '@/lib/office/keynotes/deckFactory';
import type { Deck, Slide } from '@/types/keynotes/deck';
import { themeById } from '@/data/office/keynotes/themes';

const deckWithSlide = () => newDeck({ slides: [newSlide('cover', themeById('midnight'), 1)] });

describe('serialize/parse deck json', () => {
  it('round-trips a deck', () => {
    const deck = newDeck({ title: 'Roundtrip' });
    const parsed = parseDeckJson(serializeDeckJson(deck));
    expect(parsed).toEqual(deck);
  });

  it('rejects invalid payloads', () => {
    expect(() => parseDeckJson('{"foo":1}')).toThrow();
    expect(() => parseDeckJson('not json')).toThrow();
  });
});

describe('slideToSvg', () => {
  it('renders a text object into svg text', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [newTextObject({ text: 'Hello', x: 100, y: 100 })];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Hello');
    expect(svg).toContain(`viewBox="0 0 ${deck.width} ${deck.height}"`);
  });

  it('renders every supported object kind', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newShapeObject({ shapeType: 'ellipse' }),
      newChartObject(),
      newTableObject(),
      newDiagramObject(),
      newIconObject(),
      newEquationObject(),
      newTextObject(),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<svg');
    expect(svg).toContain('<path');
    expect(svg).toContain('<rect');
  });

  it('bakes the slide background', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.background = { type: 'solid', color: '#123456', opacity: 1 };
    expect(slideToSvg(slide, deck)).toContain('#123456');
  });

  it('renders text with left alignment and top vertical', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newTextObject({
        text: 'Left align',
        style: {
          ...newTextObject().style,
          align: 'left',
          vertical: 'top',
        },
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('text-anchor="start"');
  });

  it('renders text with right alignment and bottom vertical', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newTextObject({
        text: 'Right align',
        style: {
          ...newTextObject().style,
          align: 'right',
          vertical: 'bottom',
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
        },
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('text-anchor="end"');
    expect(svg).toContain('font-weight="bold"');
    expect(svg).toContain('font-style="italic"');
    expect(svg).toContain('text-decoration="underline line-through"');
  });

  it('renders multiline text objects', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [newTextObject({ text: 'Line 1\nLine 2\nLine 3' })];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('Line 1');
    expect(svg).toContain('Line 2');
  });

  it('renders shape with shadow, stroke, and dashed dash', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newShapeObject({
        shapeType: 'ellipse',
        shadow: {
          enabled: true,
          color: '#000',
          blur: 10,
          offsetX: 2,
          offsetY: 3,
        },
        stroke: { color: '#fff', width: 2, dash: 'dashed' },
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('filter="url(#sh-');
    expect(svg).toContain('stroke-dasharray="8 6"');
  });

  it('renders shape with dotted stroke', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newShapeObject({
        shapeType: 'rect',
        stroke: { color: '#fff', width: 2, dash: 'dotted' },
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('stroke-dasharray="3 4"');
  });

  it('renders line shape', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newShapeObject({
        shapeType: 'line',
        stroke: { color: '#fff', width: 4, dash: 'solid' },
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<line');
  });

  it('renders shape with text content', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [newShapeObject({ shapeType: 'rect', text: 'Shape text' })];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('Shape text');
  });

  it('renders shape with default style when style is missing', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    const obj = newShapeObject({ shapeType: 'rect', text: 'Default style' });
    delete (obj as { style?: unknown }).style;
    slide.objects = [obj];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('Default style');
  });

  it('renders image object with pattern fill', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [newImageObject({ src: 'data:image/png;base64,abc' })];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<image');
    expect(svg).toContain('<pattern');
  });

  it('renders media object', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [newMediaObject({ src: 'video.mp4' })];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('fill="#111827"');
  });

  it('renders embed object', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [newEmbedObject({ url: 'https://youtube.com/123' })];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<rect');
  });

  it('renders drawing object', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newDrawingObject({
        strokes: [
          [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ],
        ],
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<polyline');
  });

  it('renders equation object', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [newEquationObject({ latex: 'E=mc^2' })];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('E=mc^2');
  });

  it('renders object with rotation and flip transforms', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newTextObject({
        rotation: 45,
        flipH: true,
        flipV: true,
        text: 'Transformed',
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('rotate(45');
    expect(svg).toContain('scale(-1 1)');
    expect(svg).toContain('scale(1 -1)');
  });

  it('renders gradient fill on shapes', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newShapeObject({
        fill: {
          type: 'gradient',
          from: '#ff0000',
          to: '#0000ff',
          angle: 90,
          opacity: 1,
        },
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<linearGradient');
  });

  it('renders pattern fill on shapes', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newShapeObject({
        fill: { type: 'pattern', pattern: 'dots', color: '#ffffff' },
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('fill="#ffffff"');
  });

  it('renders none fill on shapes', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [newShapeObject({ fill: { type: 'none' } })];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('fill="none"');
  });

  it('renders image fill on shapes', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newShapeObject({
        fill: {
          type: 'image',
          imageUrl: 'data:image/png;base64,abc',
          opacity: 0.8,
        },
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('fill="url(#img-');
  });

  it('renders chart object with pie type', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newChartObject({
        chartType: 'pie',
        data: [[30, 70]],
        colors: ['#ff0000', '#00ff00'],
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<path');
  });

  it('renders chart object with doughnut type', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newChartObject({
        chartType: 'doughnut',
        data: [[40, 60]],
        colors: ['#ff0000', '#00ff00'],
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<path');
  });

  it('renders chart object with line type', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newChartObject({
        chartType: 'line',
        data: [[10, 20, 30]],
        colors: ['#ff0000'],
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<polyline');
  });

  it('renders chart object with area type', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newChartObject({
        chartType: 'area',
        data: [[10, 20, 30]],
        colors: ['#ff0000'],
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<polygon');
    expect(svg).toContain('<polyline');
  });

  it('renders chart object with scatter type', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newChartObject({
        chartType: 'scatter',
        data: [
          [1, 2, 3],
          [4, 5, 6],
        ],
        colors: ['#ff0000'],
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<circle');
  });

  it('renders diagram hierarchy', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newDiagramObject({
        diagramType: 'hierarchy',
        items: ['A', 'B', 'C'],
        color: '#6366f1',
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<rect');
  });

  it('renders diagram pyramid', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newDiagramObject({
        diagramType: 'pyramid',
        items: ['Level 1', 'Level 2', 'Level 3'],
        color: '#6366f1',
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<polygon');
  });

  it('renders diagram matrix', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newDiagramObject({
        diagramType: 'matrix',
        items: ['A', 'B', 'C', 'D'],
        color: '#6366f1',
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<rect');
  });

  it('renders diagram cycle', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.objects = [
      newDiagramObject({
        diagramType: 'cycle',
        items: ['A', 'B'],
        color: '#6366f1',
      }),
    ];
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<rect');
  });

  it('renders non-solid slide background', () => {
    const deck = deckWithSlide();
    const slide = deck.slides[0];
    slide.background = {
      type: 'gradient',
      from: '#000',
      to: '#fff',
      angle: 90,
      opacity: 1,
    };
    const svg = slideToSvg(slide, deck);
    expect(svg).toContain('<rect');
  });

  it('exportHtml filters hidden slides', () => {
    const deck = newDeck({
      title: 'Hidden Slides',
      slides: [
        newSlide('cover', themeById('midnight'), 1),
        newSlide('title', themeById('midnight'), 2),
      ],
    });
    deck.slides[1].hidden = true;
    const html = exportHtml(deck);
    expect(html).toContain('Hidden Slides');
    // hidden slide should not be rendered
    expect(html.match(/<section class="slide">/g)).toHaveLength(1);
  });
});

describe('export helpers', () => {
  let createUrl: jest.Mock;
  let click: jest.Mock;

  beforeEach(() => {
    createUrl = jest.fn().mockReturnValue('blob:test');
    URL.createObjectURL = createUrl as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = jest.fn();
    click = jest.fn();
    HTMLAnchorElement.prototype.click = click;
  });

  it('exportSlideSvg downloads a single slide', () => {
    const deck = deckWithSlide();
    exportSlideSvg(deck.slides[0], deck, 0);
    expect(click).toHaveBeenCalled();
  });

  it('exportDeckJson downloads the deck file', () => {
    const deck = newDeck({ title: 'Export Me' });
    exportDeckJson(deck);
    expect(click).toHaveBeenCalled();
  });

  it('exportSlidePng draws the slide to a canvas', async () => {
    HTMLCanvasElement.prototype.getContext = (() =>
      ({
        drawImage: jest.fn(),
        fillRect: jest.fn(),
      }) as unknown as CanvasRenderingContext2D) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toBlob = jest.fn((cb: BlobCallback) => cb(new Blob(['png'])));
    global.Image = class {
      set src(_v: string) {
        setTimeout(() => this.onload?.(), 0);
      }
      onload?: () => void;
    } as unknown as typeof Image;

    const deck = deckWithSlide();
    await exportSlidePng(deck.slides[0], deck, 0);
    expect(click).toHaveBeenCalled();
  });

  it('exportHtml produces a navigable document', () => {
    const deck = newDeck({ title: 'My Deck' });
    const html = exportHtml(deck);
    expect(html).toContain('My Deck');
    expect(html).toContain('.slide');
    expect(html).toContain('ArrowRight');
  });

  it('slideStorySvg stacks visible slides into one tall svg', () => {
    const deck = newDeck({
      title: 'Story',
      slides: [
        newSlide('cover', themeById('midnight'), 1),
        newSlide('title', themeById('midnight'), 2),
      ],
    });
    deck.slides[1].hidden = true;
    const svg = slideStorySvg(deck);
    expect(svg).toContain(`height="${deck.height * 1}"`);
    expect(svg.match(/<svg x="0" y=/g)).toHaveLength(1);
  });

  it('serializeThemeFile emits a shareable theme payload', () => {
    const deck = newDeck({ title: 'Theme deck' });
    const theme = JSON.parse(serializeThemeFile(deck)) as {
      format: string;
      name: string;
      colors: Record<string, string>;
    };
    expect(theme.format).toBe('keynotes-theme');
    expect(theme.name).toBe(deck.theme.name);
    expect(theme.colors.primary).toBe(deck.theme.colors.primary);
  });

  it('exportPptxMock downloads a pptx mock archive', () => {
    const deck = newDeck({ title: 'PPTX Test' });
    exportPptxMock(deck);
    expect(click).toHaveBeenCalled();
  });

  it('exportHtmlFile downloads the HTML file', () => {
    const deck = newDeck({ title: 'HTML Test' });
    exportHtmlFile(deck);
    expect(click).toHaveBeenCalled();
  });

  it('exportThemeFile downloads the theme json', () => {
    const deck = newDeck({ title: 'Theme DL' });
    exportThemeFile(deck);
    expect(click).toHaveBeenCalled();
  });

  it('exportDeckStorySvg downloads a stacked SVG', () => {
    const deck = newDeck({
      title: 'Story DL',
      slides: [
        newSlide('cover', themeById('midnight'), 1),
        newSlide('title', themeById('midnight'), 2),
      ],
    });
    exportDeckStorySvg(deck);
    expect(click).toHaveBeenCalled();
  });

  it('exportDeckPngs exports each visible slide', async () => {
    setupCanvasForPng();
    const deck = newDeck({
      title: 'All PNG',
      slides: [
        newSlide('cover', themeById('midnight'), 1),
        newSlide('title', themeById('midnight'), 2),
      ],
    });
    deck.slides[1].hidden = true;
    await exportDeckPngs(deck);
    expect(click).toHaveBeenCalled();
  });

  it('exportDeckStoryPng draws all visible slides to one canvas', async () => {
    setupCanvasForPng();
    const deck = newDeck({
      title: 'Story PNG',
      slides: [
        newSlide('cover', themeById('midnight'), 1),
        newSlide('title', themeById('midnight'), 2),
      ],
    });
    await exportDeckStoryPng(deck);
    expect(click).toHaveBeenCalled();
  });
});

function setupCanvasForPng() {
  HTMLCanvasElement.prototype.getContext = (() =>
    ({
      drawImage: jest.fn(),
      fillRect: jest.fn(),
    }) as unknown as CanvasRenderingContext2D) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.toBlob = jest.fn((cb: BlobCallback) => cb(new Blob(['png'])));
  global.Image = class {
    set src(_v: string) {
      setTimeout(() => this.onload?.(), 0);
    }
    onload?: () => void;
  } as unknown as typeof Image;
}
