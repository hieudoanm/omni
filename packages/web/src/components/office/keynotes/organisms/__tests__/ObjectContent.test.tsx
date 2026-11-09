import { render, screen } from '@testing-library/react';
import { ObjectRenderer } from '@/components/office/keynotes/organisms/ObjectRenderer';
import {
  ObjectContent,
  TextContent,
  ShapeContent,
  ChartContent,
  TableContent,
  DiagramContent,
  textStyleCss,
  bulletLines,
  VerticalAlignStyle,
  FONT_CLASS,
} from '@/components/office/keynotes/organisms/ObjectContent';
import {
  newShapeObject,
  newTextObject,
  newChartObject,
  newTableObject,
  newIconObject,
  newDiagramObject,
  newEquationObject,
  newImageObject,
  newMediaObject,
  newEmbedObject,
  newDrawingObject,
} from '@/lib/office/keynotes/deckFactory';

const shape = (partial: Parameters<typeof newShapeObject>[0]) => newShapeObject(partial);

const text = (partial?: Parameters<typeof newTextObject>[0]) => newTextObject(partial);

const innerDiv = (container: HTMLElement) =>
  container.querySelector('div.h-full.w-full:not(.relative)') as HTMLElement;

/* ─── Pure helper tests ─────────────────────────────────────── */

describe('textStyleCss', () => {
  it('returns correct CSS for bold+italic+underline+strikethrough', () => {
    const s = textStyleCss({
      fontFamily: 'sans',
      fontSize: 20,
      color: '#000',
      bold: true,
      italic: true,
      underline: true,
      strikethrough: true,
      lineHeight: 1.5,
      letterSpacing: 1,
      align: 'center',
      bullet: false,
      numbered: false,
      vertical: 'middle',
    });
    expect(s.fontWeight).toBe(700);
    expect(s.fontStyle).toBe('italic');
    expect(s.textDecoration).toBe('underline line-through');
    expect(s.letterSpacing).toBe('1px');
  });

  it('uses transparent highlight when none provided', () => {
    const s = textStyleCss({
      fontFamily: 'sans',
      fontSize: 14,
      color: '#000',
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      lineHeight: 1,
      letterSpacing: 0,
      align: 'left',
      bullet: false,
      numbered: false,
      vertical: 'top',
    });
    expect(s.backgroundColor).toBe('transparent');
  });

  it('uses highlight color when provided', () => {
    const s = textStyleCss({
      fontFamily: 'sans',
      fontSize: 14,
      color: '#000',
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      lineHeight: 1,
      letterSpacing: 0,
      align: 'left',
      bullet: false,
      numbered: false,
      vertical: 'top',
      highlight: '#ff0',
    });
    expect(s.backgroundColor).toBe('#ff0');
  });
});

describe('bulletLines', () => {
  it('prepends bullet for non-empty lines', () => {
    expect(bulletLines('a\nb', false)).toEqual(['• a', '• b']);
  });

  it('prepends numbers for numbered lines', () => {
    expect(bulletLines('x\ny\nz', true)).toEqual(['1. x', '2. y', '3. z']);
  });

  it('returns empty lines unchanged', () => {
    expect(bulletLines('a\n\nb', false)).toEqual(['• a', '', '• b']);
  });
});

describe('VerticalAlignStyle', () => {
  it('has top/middle/bottom', () => {
    expect(VerticalAlignStyle.top.justifyContent).toBe('flex-start');
    expect(VerticalAlignStyle.middle.justifyContent).toBe('center');
    expect(VerticalAlignStyle.bottom.justifyContent).toBe('flex-end');
  });
});

describe('FONT_CLASS', () => {
  it('maps all font families', () => {
    expect(FONT_CLASS.sans).toBe('font-sans');
    expect(FONT_CLASS.serif).toBe('font-serif');
    expect(FONT_CLASS.mono).toBe('font-mono');
  });
});

/* ─── TextContent branches ─────────────────────────────────── */

describe('TextContent branches', () => {
  it('renders numbered bullet lines', () => {
    render(
      <TextContent
        obj={text({
          text: 'First\nSecond',
          style: { ...newTextObject().style, numbered: true },
        })}
      />,
    );
    expect(screen.getByText(/1\. First/)).toBeTruthy();
    expect(screen.getByText(/2\. Second/)).toBeTruthy();
  });

  it('renders bullet lines', () => {
    const { container } = render(
      <TextContent
        obj={text({
          text: 'Alpha\nBeta',
          style: { ...newTextObject().style, bullet: true },
        })}
      />,
    );
    const inner = container.querySelector('.w-full');
    expect(inner?.textContent).toContain('• Alpha');
    expect(inner?.textContent).toContain('• Beta');
  });

  it('renders sub script style', () => {
    render(
      <TextContent
        obj={text({
          text: 'H2O',
          style: { ...newTextObject().style, script: 'sub' },
        })}
      />,
    );
    const span = screen.getByText('H2O');
    expect(span.style.fontSize).toContain('15.6');
    expect(span.style.transform).toContain('translateY(0.4em)');
  });

  it('renders sup script style', () => {
    render(
      <TextContent
        obj={text({
          text: 'x2',
          style: { ...newTextObject().style, script: 'sup' },
        })}
      />,
    );
    const span = screen.getByText('x2');
    expect(span.style.transform).toContain('translateY(-0.4em)');
  });

  it('renders rotate-ccw transform', () => {
    render(
      <TextContent
        obj={text({
          text: 'Back',
          style: { ...newTextObject().style, transform: 'rotate-ccw' },
        })}
      />,
    );
    const el = screen.getByText('Back');
    expect(el.getAttribute('style')).toContain('rotate(-90deg)');
  });

  it('renders no transform (default)', () => {
    render(
      <TextContent
        obj={text({
          text: 'Plain',
          style: { ...newTextObject().style, transform: 'none' },
        })}
      />,
    );
    expect(screen.getByText('Plain')).toBeTruthy();
  });

  it('renders arc in editing mode as normal text', () => {
    render(
      <TextContent
        obj={text({
          text: 'Edit arc',
          style: { ...newTextObject().style, transform: 'arc' },
        })}
        editing
      />,
    );
    expect(screen.getByText('Edit arc')).toBeTruthy();
  });

  it('renders wave with odd lines styled differently', () => {
    const { container } = render(
      <TextContent
        obj={text({
          text: 'A\nB\nC',
          style: { ...newTextObject().style, transform: 'wave' },
        })}
      />,
    );
    const skewed = container.querySelector('[style*="skewX"]');
    expect(skewed).toBeTruthy();
    expect(skewed?.getAttribute('style')).toContain('translateY(0.25em)');
    expect(skewed?.getAttribute('style')).toContain('skewX(-8deg)');
    expect(skewed?.getAttribute('style')).toContain('opacity: 0.85');
  });

  it('applies solid fill background', () => {
    render(
      <TextContent
        obj={text({
          text: 'Filled',
          fill: { type: 'solid', color: '#ff0000', opacity: 0.5 },
        })}
      />,
    );
    const wrapper = screen.getByText('Filled').closest('.flex.h-full.w-full');
    expect(wrapper?.getAttribute('style')).toContain('rgb(255, 0, 0)');
  });

  it('does not apply fill when fill is not solid', () => {
    render(
      <TextContent
        obj={text({
          text: 'No fill',
          fill: {
            type: 'gradient',
            from: '#000',
            to: '#fff',
            angle: 0,
            opacity: 1,
          },
        })}
      />,
    );
    const wrapper = screen.getByText('No fill').closest('.flex.h-full.w-full');
    expect(wrapper?.getAttribute('style')).not.toContain('backgroundColor');
  });

  it('applies editing cursor class', () => {
    const { container } = render(<TextContent obj={text({ text: 'Edit me' })} editing />);
    const outer = container.querySelector('.cursor-text');
    expect(outer).toBeTruthy();
  });

  it('applies pointer-events-none when not editing', () => {
    const { container } = render(<TextContent obj={text({ text: 'Readonly' })} />);
    const outer = container.querySelector('.pointer-events-none');
    expect(outer).toBeTruthy();
  });

  it('renders with script=none (no script style)', () => {
    render(
      <TextContent
        obj={text({
          text: 'Normal',
          style: { ...newTextObject().style, script: 'none' },
        })}
      />,
    );
    expect(screen.getByText('Normal')).toBeTruthy();
  });
});

/* ─── ShapeContent branches ────────────────────────────────── */

describe('ShapeContent rect and rounded-rect (useDiv)', () => {
  it('renders rounded-rect with borderRadius', () => {
    const { container } = render(
      <ShapeContent obj={shape({ shapeType: 'rounded-rect', cornerRadius: 20 })} />,
    );
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).toContain('border-radius: 20');
  });

  it('renders rect with borderRadius 0', () => {
    const { container } = render(<ShapeContent obj={shape({ shapeType: 'rect' })} />);
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).toContain('border-radius: 0');
  });
});

describe('ShapeContent fill: none', () => {
  it('returns undefined fillCss (transparent bg)', () => {
    const { container } = render(<ShapeContent obj={shape({ fill: { type: 'none' } })} />);
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).toContain('transparent');
  });
});

describe('ShapeContent fill: pattern', () => {
  it('renders dots pattern', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          fill: { type: 'pattern', pattern: 'dots', color: '#fff' },
        })}
      />,
    );
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).toContain('radial-gradient');
    expect(div?.getAttribute('style')).toContain('12px 12px');
  });

  it('renders grid pattern', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          fill: { type: 'pattern', pattern: 'grid', color: '#000' },
        })}
      />,
    );
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).toContain('linear-gradient');
    expect(div?.getAttribute('style')).toContain('24px 24px');
  });

  it('renders stripes pattern', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          fill: { type: 'pattern', pattern: 'stripes', color: '#aaa' },
        })}
      />,
    );
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).toContain('repeating-linear-gradient');
    expect(div?.getAttribute('style')).toContain('24px 24px');
  });
});

describe('ShapeContent stroke', () => {
  it('renders empty style when width <= 0', () => {
    const { container } = render(
      <ShapeContent obj={shape({ stroke: { color: '#000', width: 0, dash: 'solid' } })} />,
    );
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).not.toMatch(/border:\s/);
  });

  it('renders empty style when color transparent', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          stroke: { color: 'transparent', width: 2, dash: 'solid' },
        })}
      />,
    );
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).not.toMatch(/border:\s/);
  });

  it('renders dashed stroke on rect', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'rect',
          stroke: { color: '#000', width: 3, dash: 'dashed' },
        })}
      />,
    );
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).toContain('dashed');
  });

  it('renders dotted stroke on rect', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'rect',
          stroke: { color: '#000', width: 3, dash: 'dotted' },
        })}
      />,
    );
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).toContain('dotted');
  });
});

describe('ShapeContent effects', () => {
  it('applies bevel borders on div shape', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          fill: { type: 'solid', color: '#ccc', opacity: 1 },
          effect: { bevel: true },
        })}
      />,
    );
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).toContain('rgba(255, 255, 255, 0.3)');
    expect(div?.getAttribute('style')).toContain('rgba(0, 0, 0, 0.35)');
  });

  it('applies softEdges + solid fill shadow on div', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          fill: { type: 'solid', color: '#22c55e', opacity: 1 },
          effect: { softEdges: 12 },
        })}
      />,
    );
    const div = container.querySelector('div.h-full.w-full');
    expect(div?.getAttribute('style')).toContain('12px');
  });

  it('applies reflection on div shape wrapper', () => {
    const { container } = render(
      <ObjectContent
        obj={shape({
          effect: { reflection: true },
        })}
      />,
    );
    const allDivs = container.querySelectorAll('div');
    const wrapper = Array.from(allDivs).find((d) => d.className.split(' ').includes('relative'));
    expect(wrapper).toBeTruthy();
    const el = wrapper as unknown as { style: Record<string, string> };
    expect(el.style.WebkitBoxReflect).toContain('linear-gradient');
  });

  it('does not apply reflection when not set', () => {
    const { container } = render(<ObjectContent obj={shape({})} />);
    const allDivs = container.querySelectorAll('div');
    const wrapper = Array.from(allDivs).find((d) => d.className.split(' ').includes('relative'));
    expect(wrapper).toBeTruthy();
    const el = wrapper as unknown as { style: Record<string, string> };
    expect(el.style.WebkitBoxReflect ?? '').not.toContain('linear-gradient');
  });
});

describe('ShapeContent SVG shapes', () => {
  it('renders SVG path for ellipse', () => {
    const { container } = render(<ShapeContent obj={shape({ shapeType: 'ellipse' })} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('path')).toBeTruthy();
  });

  it('renders line with solid stroke', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'line',
          stroke: { color: '#ff0000', width: 4, dash: 'solid' },
        })}
      />,
    );
    const line = container.querySelector('line');
    expect(line).toBeTruthy();
    expect(line?.getAttribute('stroke')).toBe('#ff0000');
    expect(line?.getAttribute('stroke-dasharray')).toBeNull();
  });

  it('renders line with dashed stroke', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'line',
          stroke: { color: '#000', width: 3, dash: 'dashed' },
        })}
      />,
    );
    const line = container.querySelector('line');
    expect(line?.getAttribute('stroke-dasharray')).toBe('8 6');
  });

  it('renders line with dotted stroke', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'line',
          stroke: { color: '#000', width: 3, dash: 'dotted' },
        })}
      />,
    );
    const line = container.querySelector('line');
    expect(line?.getAttribute('stroke-dasharray')).toBe('3 4');
  });

  it('renders line without arrows', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'line',
          stroke: { color: '#000', width: 2, dash: 'solid' },
        })}
      />,
    );
    const line = container.querySelector('line');
    expect(line?.getAttribute('marker-start')).toBeNull();
    expect(line?.getAttribute('marker-end')).toBeNull();
  });

  it('renders line with only arrowStart', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'line',
          stroke: { color: '#fff', width: 4, dash: 'solid', arrowStart: true },
        })}
      />,
    );
    const line = container.querySelector('line');
    expect(line?.getAttribute('marker-start')).toContain('ast-');
    expect(line?.getAttribute('marker-end')).toBeNull();
  });

  it('renders line with only arrowEnd', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'line',
          stroke: { color: '#fff', width: 4, dash: 'solid', arrowEnd: true },
        })}
      />,
    );
    const line = container.querySelector('line');
    expect(line?.getAttribute('marker-start')).toBeNull();
    expect(line?.getAttribute('marker-end')).toContain('aen-');
  });

  it('renders ellipse with solid fill', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          fill: { type: 'solid', color: '#ff0000', opacity: 0.8 },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toBe('#ff0000');
    expect(path?.getAttribute('fill-opacity')).toBe('0.8');
  });

  it('renders ellipse with none fill', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          fill: { type: 'none' },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toBe('none');
  });

  it('renders ellipse with image fill (transparent)', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          fill: { type: 'image', imageUrl: 'x.png', opacity: 1 },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toBe('transparent');
  });

  it('renders ellipse with gradient fill using url()', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          fill: {
            type: 'gradient',
            from: '#000',
            to: '#fff',
            angle: 0,
            opacity: 1,
            stops: [
              { color: '#000', offset: 0 },
              { color: '#fff', offset: 1 },
            ],
          },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toContain('url(#grad-');
  });

  it('renders ellipse with gradient fill (no stops)', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          fill: {
            type: 'gradient',
            from: '#000',
            to: '#fff',
            angle: 45,
            opacity: 0.9,
          },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('fill')).toContain('url(#grad-');
    expect(path?.getAttribute('fill-opacity')).toBe('0.9');
  });

  it('renders ellipse stroke dasharray for dashed', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          stroke: { color: '#333', width: 2, dash: 'dashed' },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke-dasharray')).toBe('8 6');
  });

  it('renders ellipse stroke dasharray for dotted', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          stroke: { color: '#333', width: 2, dash: 'dotted' },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke-dasharray')).toBe('3 4');
  });

  it('renders transparent stroke when color is transparent', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          stroke: { color: 'transparent', width: 2, dash: 'solid' },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke')).toBe('none');
  });

  it('renders stroke with valid color', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          stroke: { color: '#abc', width: 5, dash: 'solid' },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke')).toBe('#abc');
    expect(path?.getAttribute('stroke-width')).toBe('5');
  });

  it('renders SVG filter with glow and shadow on ellipse', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          fill: { type: 'solid', color: '#22c55e', opacity: 1 },
          shadow: {
            enabled: true,
            color: '#000',
            blur: 8,
            offsetX: 2,
            offsetY: 2,
          },
          effect: { glowColor: '#0f0', glowBlur: 10 },
        })}
      />,
    );
    const filter = container.querySelector('filter');
    expect(filter).toBeTruthy();
    const shadows = filter?.querySelectorAll('feDropShadow');
    expect(shadows?.length).toBe(2);
  });

  it('returns empty defs when no effects on SVG shape', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          shadow: {
            enabled: false,
            color: '#000',
            blur: 0,
            offsetX: 0,
            offsetY: 0,
          },
        })}
      />,
    );
    const filter = container.querySelector('filter');
    expect(filter).toBeNull();
  });
});

describe('ShapeContent with text overlay', () => {
  it('renders text overlay when text is provided', () => {
    const { container } = render(<ObjectContent obj={shape({ text: 'Label' })} />);
    const overlay = container.querySelector('.absolute.inset-0.flex.items-center');
    expect(overlay).toBeTruthy();
    expect(overlay?.textContent).toBe('Label');
  });

  it('does not render text overlay when text is empty', () => {
    const { container } = render(<ObjectContent obj={shape({ text: '' })} />);
    const overlay = container.querySelector('.absolute.inset-0.flex.items-center');
    expect(overlay).toBeNull();
  });

  it('does not render text overlay when text is whitespace only', () => {
    const { container } = render(<ObjectContent obj={shape({ text: '   ' })} />);
    const overlay = container.querySelector('.absolute.inset-0.flex.items-center');
    expect(overlay).toBeNull();
  });
});

/* ─── ChartContent branches ────────────────────────────────── */

describe('ChartContent', () => {
  it('renders column chart (bar/column)', () => {
    const { container } = render(
      <ChartContent obj={newChartObject({ chartType: 'column', showLegend: false })} />,
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(5);
  });

  it('renders bar chart', () => {
    const { container } = render(
      <ChartContent obj={newChartObject({ chartType: 'bar', showLegend: false })} />,
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(5);
  });

  it('renders line chart', () => {
    const { container } = render(
      <ChartContent
        obj={newChartObject({
          chartType: 'line',
          showLegend: false,
          data: [[10, 20, 30]],
        })}
      />,
    );
    expect(container.querySelector('polyline')).toBeTruthy();
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(3);
  });

  it('renders area chart with polygon', () => {
    const { container } = render(
      <ChartContent
        obj={newChartObject({
          chartType: 'area',
          showLegend: false,
          data: [[10, 20]],
        })}
      />,
    );
    expect(container.querySelector('polygon')).toBeTruthy();
    expect(container.querySelector('polyline')).toBeTruthy();
  });

  it('renders scatter chart', () => {
    const { container } = render(
      <ChartContent
        obj={newChartObject({
          chartType: 'scatter',
          showLegend: false,
          data: [
            [10, 20, 30],
            [5, 15, 25],
          ],
        })}
      />,
    );
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(3);
  });

  it('renders pie chart', () => {
    const { container } = render(
      <ChartContent
        obj={newChartObject({
          chartType: 'pie',
          showLegend: false,
          data: [[30, 50, 20]],
        })}
      />,
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(3);
  });

  it('renders doughnut chart', () => {
    const { container } = render(
      <ChartContent
        obj={newChartObject({
          chartType: 'doughnut',
          showLegend: false,
          data: [[40, 60]],
        })}
      />,
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(2);
  });

  it('shows legend when showLegend is true', () => {
    const { container } = render(
      <ChartContent obj={newChartObject({ showLegend: true, labels: ['X', 'Y'] })} />,
    );
    expect(screen.getByText('X')).toBeTruthy();
    expect(screen.getByText('Y')).toBeTruthy();
  });

  it('hides legend when showLegend is false', () => {
    const { container } = render(<ChartContent obj={newChartObject({ showLegend: false })} />);
    expect(container.querySelector('.flex.flex-wrap')).toBeNull();
  });

  it('uses default color when colors array is empty', () => {
    const { container } = render(
      <ChartContent
        obj={newChartObject({
          chartType: 'column',
          colors: [],
          showLegend: false,
        })}
      />,
    );
    const rects = container.querySelectorAll('rect');
    expect(rects[0]?.getAttribute('fill')).toBe('#6366f1');
  });

  it('handles large arc segments (>180deg) in pie', () => {
    const { container } = render(
      <ChartContent
        obj={newChartObject({
          chartType: 'pie',
          data: [[100, 1]],
          colors: ['#ff0000', '#00ff00'],
          showLegend: false,
        })}
      />,
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(2);
  });

  it('handles single data point line chart', () => {
    const { container } = render(
      <ChartContent
        obj={newChartObject({
          chartType: 'line',
          data: [[50]],
          showLegend: false,
        })}
      />,
    );
    expect(container.querySelector('polyline')).toBeTruthy();
  });
});

/* ─── TableContent branches ────────────────────────────────── */

describe('TableContent', () => {
  it('renders header row with header styles', () => {
    const { container } = render(
      <TableContent
        obj={newTableObject({
          headerRow: true,
          data: [
            ['H1', 'H2'],
            ['A', 'B'],
          ],
          rows: 2,
          cols: 2,
        })}
      />,
    );
    const headerCell = container.querySelector('td');
    expect(headerCell?.getAttribute('style')).toContain('rgba(99, 102, 241, 0.2)');
    expect(headerCell?.getAttribute('style')).toContain('font-weight: 600');
  });

  it('renders body row without header styles', () => {
    const { container } = render(
      <TableContent
        obj={newTableObject({
          headerRow: true,
          data: [
            ['H1', 'H2'],
            ['A', 'B'],
          ],
          rows: 2,
          cols: 2,
        })}
      />,
    );
    const cells = container.querySelectorAll('td');
    const bodyCell = cells[2];
    expect(bodyCell?.getAttribute('style')).toContain('transparent');
    expect(bodyCell?.getAttribute('style')).toContain('font-weight: 400');
  });

  it('renders no header row when headerRow is false', () => {
    const { container } = render(
      <TableContent
        obj={newTableObject({
          headerRow: false,
          data: [['A', 'B']],
          rows: 1,
          cols: 2,
        })}
      />,
    );
    const cell = container.querySelector('td');
    expect(cell?.getAttribute('style')).toContain('font-weight: 400');
  });

  it('renders empty cells when data is missing', () => {
    const { container } = render(
      <TableContent
        obj={newTableObject({
          data: [['X']],
          rows: 2,
          cols: 2,
        })}
      />,
    );
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(4);
    expect(cells[1]?.textContent).toBe('');
  });

  it('clamps rows and cols to at least 1', () => {
    const { container } = render(
      <TableContent obj={newTableObject({ rows: 0, cols: 0, data: [] })} />,
    );
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(1);
  });
});

/* ─── DiagramContent branches ──────────────────────────────── */

describe('DiagramContent', () => {
  it('renders hierarchy diagram', () => {
    const { container } = render(
      <DiagramContent
        obj={newDiagramObject({
          diagramType: 'hierarchy',
          items: ['Root', 'Child1', 'Child2'],
        })}
      />,
    );
    expect(screen.getByText('Root')).toBeTruthy();
    expect(screen.getByText('Child1')).toBeTruthy();
  });

  it('renders process diagram with arrows', () => {
    const { container } = render(
      <DiagramContent
        obj={newDiagramObject({
          diagramType: 'process',
          items: ['Step 1', 'Step 2', 'Step 3'],
        })}
      />,
    );
    const arrows = container.querySelectorAll('span.text-\\[10px\\]');
    expect(arrows.length).toBe(2);
  });

  it('renders cycle diagram without arrows', () => {
    const { container } = render(
      <DiagramContent
        obj={newDiagramObject({
          diagramType: 'cycle',
          items: ['A', 'B', 'C'],
        })}
      />,
    );
    expect(screen.getByText('A')).toBeTruthy();
    const arrows = container.querySelectorAll('span.text-\\[10px\\]');
    expect(arrows.length).toBe(0);
  });

  it('renders matrix diagram', () => {
    const { container } = render(
      <DiagramContent
        obj={newDiagramObject({
          diagramType: 'matrix',
          items: ['A', 'B', 'C', 'D'],
        })}
      />,
    );
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('D')).toBeTruthy();
  });

  it('renders pyramid diagram', () => {
    const { container } = render(
      <DiagramContent
        obj={newDiagramObject({
          diagramType: 'pyramid',
          items: ['Top', 'Mid', 'Bot'],
        })}
      />,
    );
    expect(screen.getByText('Top')).toBeTruthy();
  });

  it('returns null for unknown diagram type', () => {
    const { container } = render(
      <DiagramContent
        obj={
          {
            ...newDiagramObject(),
            diagramType: 'unknown' as never,
          } as never
        }
      />,
    );
    expect(container.innerHTML).toBe('');
  });
});

/* ─── IconObject branches ──────────────────────────────────── */

describe('ObjectContent icon', () => {
  it('renders a known icon', () => {
    const { container } = render(<ObjectContent obj={newIconObject({ icon: 'star' })} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('falls back to star icon for unknown icon', () => {
    const { container } = render(<ObjectContent obj={newIconObject({ icon: 'nonexistent' })} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

/* ─── EquationObject branches ──────────────────────────────── */

describe('ObjectContent equation', () => {
  it('renders latex text with computed font size', () => {
    render(<ObjectContent obj={newEquationObject({ latex: 'a+b=c', w: 200, h: 100 })} />);
    expect(screen.getByText('a+b=c')).toBeTruthy();
    const el = screen.getByText('a+b=c');
    expect(el.getAttribute('style')).toContain('font-size: calc');
  });
});

/* ─── DrawingObject branches ───────────────────────────────── */

describe('ObjectContent drawing', () => {
  it('renders strokes as polyline', () => {
    const { container } = render(
      <ObjectContent
        obj={newDrawingObject({
          strokes: [
            [
              { x: 0, y: 0 },
              { x: 10, y: 10 },
            ],
          ],
          w: 100,
          h: 100,
        })}
      />,
    );
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeTruthy();
    expect(polyline?.getAttribute('points')).toBe('0,0 10,10');
  });

  it('renders multiple strokes', () => {
    const { container } = render(
      <ObjectContent
        obj={newDrawingObject({
          strokes: [
            [
              { x: 0, y: 0 },
              { x: 1, y: 1 },
            ],
            [
              { x: 2, y: 2 },
              { x: 3, y: 3 },
            ],
          ],
        })}
      />,
    );
    expect(container.querySelectorAll('polyline').length).toBe(2);
  });
});

/* ─── ImageObject branches ─────────────────────────────────── */

describe('ObjectContent image', () => {
  it('renders img with border when width > 0', () => {
    const { container } = render(
      <ObjectContent
        obj={newImageObject({
          src: 'test.png',
          alt: 'test',
          border: { color: '#ff0000', width: 3, dash: 'solid' },
        })}
      />,
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('style')).toContain('solid');
    expect(img?.getAttribute('style')).toContain('rgb(255, 0, 0)');
  });

  it('renders img with dashed border', () => {
    const { container } = render(
      <ObjectContent
        obj={newImageObject({
          src: 'test.png',
          alt: 'test',
          border: { color: '#000', width: 2, dash: 'dashed' },
        })}
      />,
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('style')).toContain('dashed');
  });

  it('renders img without border when width is 0', () => {
    const { container } = render(
      <ObjectContent
        obj={newImageObject({
          src: 'test.png',
          alt: 'test',
          border: { color: '#000', width: 0, dash: 'solid' },
        })}
      />,
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('style')).not.toMatch(/border:\s/);
  });

  it('renders img with no border property', () => {
    const { container } = render(
      <ObjectContent obj={newImageObject({ src: 'img.png', alt: '', border: undefined })} />,
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('style')).toContain('border-radius: 8');
  });
});

/* ─── MediaObject branches ─────────────────────────────────── */

describe('ObjectContent media', () => {
  it('renders video when mime is video', () => {
    const { container } = render(
      <ObjectContent obj={newMediaObject({ mime: 'video', src: 'vid.mp4' })} />,
    );
    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video?.getAttribute('src')).toBe('vid.mp4');
    expect(video?.getAttribute('controls')).toBe('');
  });

  it('renders audio when mime is audio', () => {
    const { container } = render(
      <ObjectContent obj={newMediaObject({ mime: 'audio', src: 'track.mp3' })} />,
    );
    const audio = container.querySelector('audio');
    expect(audio).toBeTruthy();
    expect(audio?.getAttribute('src')).toBe('track.mp3');
  });

  it('disables controls when editing', () => {
    const { container } = render(
      <ObjectContent obj={newMediaObject({ mime: 'video', src: 'v.mp4' })} editing />,
    );
    const video = container.querySelector('video');
    expect(video?.getAttribute('controls')).toBeNull();
  });

  it('disables audio controls when editing', () => {
    const { container } = render(
      <ObjectContent obj={newMediaObject({ mime: 'audio', src: 'a.mp3' })} editing />,
    );
    const audio = container.querySelector('audio');
    expect(audio?.getAttribute('controls')).toBeNull();
  });
});

/* ─── EmbedObject branches ─────────────────────────────────── */

describe('ObjectContent embed', () => {
  it('renders code embed', () => {
    const { container } = render(
      <ObjectContent
        obj={newEmbedObject({
          embedType: 'code',
          code: 'const x = 1;',
          language: 'javascript',
        })}
      />,
    );
    expect(container.querySelector('pre')).toBeTruthy();
    expect(container.querySelector('code')).toBeTruthy();
  });

  it('renders code embed with empty code', () => {
    const { container } = render(
      <ObjectContent obj={newEmbedObject({ embedType: 'code', code: '' })} />,
    );
    expect(container.querySelector('code')).toBeTruthy();
  });

  it('renders youtube embed with URL', () => {
    render(
      <ObjectContent
        obj={newEmbedObject({
          embedType: 'youtube',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        })}
      />,
    );
    expect(screen.getByText(/YouTube embed: dQw4w9WgXcQ/)).toBeTruthy();
  });

  it('renders youtube embed with empty URL', () => {
    render(<ObjectContent obj={newEmbedObject({ embedType: 'youtube', url: '' })} />);
    expect(screen.getByText('YouTube URL')).toBeTruthy();
  });

  it('renders youtube embed with valid URL but no v param', () => {
    render(
      <ObjectContent
        obj={newEmbedObject({
          embedType: 'youtube',
          url: 'https://example.com/no-v',
        })}
      />,
    );
    expect(screen.getByText(/example.com/)).toBeTruthy();
  });

  it('renders mermaid embed with mermaid text', () => {
    render(
      <ObjectContent
        obj={newEmbedObject({
          embedType: 'mermaid',
          mermaid: 'graph TD; A-->B;',
        })}
      />,
    );
    expect(screen.getByText('graph TD; A-->B;')).toBeTruthy();
  });

  it('renders mermaid embed with empty mermaid text (shows empty string via ??)', () => {
    const { container } = render(
      <ObjectContent obj={newEmbedObject({ embedType: 'mermaid', mermaid: '' })} />,
    );
    expect(container.querySelector('.bg-neutral-900')).toBeTruthy();
  });
});

/* ─── GroupObject branches ─────────────────────────────────── */

describe('ObjectContent group', () => {
  it('returns null for group objects', () => {
    const { container } = render(
      <ObjectContent
        obj={
          {
            ...newTextObject(),
            kind: 'group',
            children: [],
          } as never
        }
      />,
    );
    expect(container.innerHTML).toBe('');
  });
});

/* ─── ObjectContent default case ───────────────────────────── */

describe('ObjectContent default', () => {
  it('returns null for unknown kind', () => {
    const { container } = render(
      <ObjectContent
        obj={
          {
            ...newTextObject(),
            kind: 'unknown',
          } as never
        }
      />,
    );
    expect(container.innerHTML).toBe('');
  });
});

/* ─── TextContent wave with script ─────────────────────────── */

describe('TextContent wave with script', () => {
  it('renders wave lines with script span', () => {
    render(
      <TextContent
        obj={text({
          text: 'A\nB',
          style: { ...newTextObject().style, transform: 'wave', script: 'sub' },
        })}
      />,
    );
    const spans = document.querySelectorAll('span');
    expect(spans.length).toBe(2);
  });
});

/* ─── TextContent non-wave with script + lines ─────────────── */

describe('TextContent with bullet and script', () => {
  it('renders bullet lines with script', () => {
    render(
      <TextContent
        obj={text({
          text: 'X\nY',
          style: {
            ...newTextObject().style,
            bullet: true,
            script: 'sub',
          },
        })}
      />,
    );
    expect(screen.getByText(/• X/)).toBeTruthy();
  });

  it('renders numbered lines without script', () => {
    render(
      <TextContent
        obj={text({
          text: 'A\nB',
          style: { ...newTextObject().style, numbered: true },
        })}
      />,
    );
    expect(screen.getByText(/1\. A/)).toBeTruthy();
  });
});

/* ─── ShapeContent SVG with no arrow on line ───────────────── */

describe('ShapeContent line with stroke width 0', () => {
  it('renders line with stroke width fallback', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'line',
          stroke: { color: '#000', width: 0, dash: 'solid' },
        })}
      />,
    );
    const line = container.querySelector('line');
    expect(line?.getAttribute('stroke-width')).toBe('4');
  });
});

/* ─── TextContent no bullet, no numbered ───────────────────── */

describe('TextContent plain text with no bullets', () => {
  it('renders text with newlines as-is', () => {
    const { container } = render(<TextContent obj={text({ text: 'Line1\nLine2' })} />);
    const inner = container.querySelector('.w-full');
    expect(inner?.textContent).toContain('Line1');
    expect(inner?.textContent).toContain('Line2');
  });
});

/* ─── Additional branch coverage ───────────────────────────── */

describe('TextContent arc with bold and italic', () => {
  it('renders arc SVG with bold and italic text', () => {
    const { container } = render(
      <TextContent
        obj={text({
          text: 'Bold Arc',
          w: 200,
          style: {
            ...newTextObject().style,
            transform: 'arc',
            bold: true,
            italic: true,
          },
        })}
      />,
    );
    const textEl = container.querySelector('text');
    expect(textEl?.getAttribute('font-weight')).toBe('700');
    expect(textEl?.getAttribute('font-style')).toBe('italic');
  });
});

describe('TextContent with columns=1 (no multi-column)', () => {
  it('sets columnCount to undefined when columns=1', () => {
    render(
      <TextContent
        obj={text({
          text: 'One col',
          style: { ...newTextObject().style, columns: 1 },
        })}
      />,
    );
    const el = screen.getByText('One col') as HTMLElement;
    expect(el.style.columnCount).toBe('');
  });
});

describe('ChartContent with empty data', () => {
  it('handles empty data array', () => {
    const { container } = render(
      <ChartContent obj={newChartObject({ data: [], showLegend: false })} />,
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

describe('ChartContent scatter with undefined data[0]', () => {
  it('handles scatter with undefined x data', () => {
    const { container } = render(
      <ChartContent
        obj={newChartObject({
          chartType: 'scatter',
          data: [[], [10, 20]],
          showLegend: false,
        })}
      />,
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

describe('Embed with undefined code', () => {
  it('renders code embed with undefined code', () => {
    const { container } = render(
      <ObjectContent
        obj={newEmbedObject({
          embedType: 'code',
          code: undefined,
          language: 'typescript',
        })}
      />,
    );
    expect(container.querySelector('code')).toBeTruthy();
  });
});

describe('Embed with undefined mermaid', () => {
  it('renders mermaid fallback when mermaid is undefined', () => {
    render(
      <ObjectContent
        obj={newEmbedObject({
          embedType: 'mermaid',
          mermaid: undefined,
        })}
      />,
    );
    expect(screen.getByText('Mermaid diagram')).toBeTruthy();
  });
});

describe('shapeFilters with soft edges only (no drop)', () => {
  it('returns blur filter when only softEdges is set', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          fill: { type: 'solid', color: '#8b5cf6', opacity: 1 },
          effect: { softEdges: 8 },
          shadow: {
            enabled: false,
            color: '#000',
            blur: 0,
            offsetX: 0,
            offsetY: 0,
          },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('filter')).toBe('blur(8px)');
  });
});

describe('shapeFilters with no effects', () => {
  it('returns undefined filter when no effects', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          fill: { type: 'solid', color: '#ccc', opacity: 1 },
          shadow: {
            enabled: false,
            color: '#000',
            blur: 0,
            offsetX: 0,
            offsetY: 0,
          },
        })}
      />,
    );
    const path = container.querySelector('path');
    expect(path?.getAttribute('filter')).toBeNull();
  });
});

describe('shapeFilters with glow + softEdges + shadow', () => {
  it('renders all three effects in SVG filter', () => {
    const { container } = render(
      <ShapeContent
        obj={shape({
          shapeType: 'ellipse',
          fill: { type: 'solid', color: '#22c55e', opacity: 1 },
          shadow: {
            enabled: true,
            color: '#000',
            blur: 6,
            offsetX: 2,
            offsetY: 2,
          },
          effect: {
            glowColor: '#0f0',
            glowBlur: 10,
            softEdges: 5,
          },
        })}
      />,
    );
    const filter = container.querySelector('filter');
    expect(filter).toBeTruthy();
    const shadows = filter?.querySelectorAll('feDropShadow');
    expect(shadows?.length).toBe(2);
  });
});

describe('TextContent arc transform with editing', () => {
  it('falls back to normal text when editing is true', () => {
    render(
      <TextContent
        obj={text({
          text: 'Edit Arc',
          style: { ...newTextObject().style, transform: 'arc' },
        })}
        editing
      />,
    );
    expect(screen.getByText('Edit Arc')).toBeTruthy();
  });
});
