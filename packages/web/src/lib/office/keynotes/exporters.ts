import type {
  ChartObject,
  Deck,
  DiagramObject,
  FillStyle,
  Slide,
  SlideObject,
  TableObject,
  ThemeColors,
  TextStyle,
} from '@/types/keynotes/deck';
import { FONT_FAMILY_MAP } from '@/types/keynotes/deck';
import { shapePath } from '@/lib/office/keynotes/shapes';
import { readableTextColor, withAlpha } from '@/lib/office/keynotes/color';
import { downloadBlob, downloadText } from '@/lib/office/keynotes/format';
import { clamp } from '@/lib/office/keynotes/geometry';

export const serializeDeckJson = (deck: Deck): string => JSON.stringify(deck, null, 2);

export const parseDeckJson = (text: string): Deck => {
  const data = JSON.parse(text) as Deck;
  if (!data.slides || !Array.isArray(data.slides) || !data.width || !data.height) {
    throw new Error('Not a valid deck file');
  }
  return data;
};

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fillAttrs = (fill: FillStyle): string => {
  switch (fill.type) {
    case 'none':
      return 'fill="none"';
    case 'solid':
      return `fill="${fill.color}" fill-opacity="${clamp(fill.opacity, 0, 1)}"`;
    case 'gradient': {
      const id = `g${Math.round(fill.angle)}${fill.from.replace('#', '')}${fill.to.replace('#', '')}`;
      const rad = ((fill.angle - 90) * Math.PI) / 180;
      const dx = Math.cos(rad) * 50;
      const dy = Math.sin(rad) * 50;
      return `fill="url(#${id})" fill-opacity="${clamp(fill.opacity, 0, 1)}"`;
    }
    case 'image':
      return `fill="url(#img-${fill.imageUrl.replace(/[^a-z0-9]/gi, '')})" fill-opacity="${clamp(fill.opacity, 0, 1)}"`;
    case 'pattern':
      return `fill="${fill.color}"`;
    default:
      return '';
  }
};

const textSvg = (o: SlideObject & { kind: 'text' }, colors: ThemeColors): string => {
  const s = o.style;
  const font = FONT_FAMILY_MAP[s.fontFamily] ?? s.fontFamily;
  const weight = s.bold ? 'bold' : 'normal';
  const deco = [s.underline ? 'underline' : '', s.strikethrough ? 'line-through' : '']
    .filter(Boolean)
    .join(' ');
  const anchor = s.align === 'center' ? 'middle' : s.align === 'right' ? 'end' : 'start';
  const x = s.align === 'center' ? o.w / 2 : s.align === 'right' ? o.w : 0;
  const lines = o.text.split('\n');
  const lineHeight = s.fontSize * s.lineHeight;
  const total = lines.length * lineHeight;
  const startY =
    s.vertical === 'middle'
      ? (o.h - total) / 2 + s.fontSize
      : s.vertical === 'bottom'
        ? o.h - total + s.fontSize
        : s.fontSize;
  const letterSpacing = s.letterSpacing;
  return lines
    .map(
      (line, i) =>
        `<text x="${x}" y="${startY + i * lineHeight}" font-family="${font}" font-size="${s.fontSize}" fill="${s.color}" font-weight="${weight}" text-anchor="${anchor}" font-style="${s.italic ? 'italic' : 'normal'}" text-decoration="${deco}" letter-spacing="${letterSpacing}">${esc(line || ' ')}</text>`,
    )
    .join('\n');
};

const shapeSvg = (o: SlideObject & { kind: 'shape' }, colors: ThemeColors): string => {
  const shadow = o.shadow?.enabled
    ? `<filter id="sh-${o.id}"><feDropShadow dx="${o.shadow.offsetX}" dy="${o.shadow.offsetY}" stdDeviation="${o.shadow.blur / 2}" flood-color="${o.shadow.color}" flood-opacity="0.5"/></filter>`
    : '';
  const filter = o.shadow?.enabled ? `filter="url(#sh-${o.id})"` : '';
  const stroke =
    o.stroke.width > 0 ? `stroke="${o.stroke.color}" stroke-width="${o.stroke.width}"` : '';
  const dash =
    o.stroke.dash !== 'solid'
      ? `stroke-dasharray="${o.stroke.dash === 'dashed' ? '8 6' : '3 4'}"`
      : '';
  const path = shapePath(o.shapeType);
  let inner = `<path d="${path}" ${fillAttrs(o.fill)} ${stroke} ${dash} ${filter}/>`;
  if (o.shapeType === 'line') {
    inner = `<line x1="0" y1="${o.h / 2}" x2="${o.w}" y2="${o.h / 2}" ${stroke} stroke-width="${o.stroke.width || 4}" ${dash}/>`;
  }
  const text =
    o.text && o.text.trim()
      ? textSvg(
          {
            ...o,
            kind: 'text',
            text: o.text,
            style: (o.style ?? {
              fontFamily: 'sans',
              fontSize: 18,
              color: readableTextColor(o.fill.type === 'solid' ? o.fill.color : colors.background),
              lineHeight: 1.4,
              letterSpacing: 0,
              align: 'center',
              vertical: 'middle',
            }) as TextStyle,
          },
          colors,
        )
      : '';
  return `${shadow}${inner}${text}`;
};

const chartSvg = (o: ChartObject, colors: ThemeColors): string => {
  const { chartType, data, labels, colors: chartColors } = o;
  const pad = 10;
  const cw = o.w - pad * 2;
  const ch = o.h - pad * 2;
  const series = data[0] ?? [];
  const max = Math.max(...series, 1);

  switch (chartType) {
    case 'pie':
    case 'doughnut': {
      const total = series.reduce((s, v) => s + v, 0) || 1;
      let acc = 0;
      const arcs = series.map((v, i) => {
        const start = (acc / total) * 360;
        acc += v;
        const end = (acc / total) * 360;
        const r = cw / 2;
        const cx = o.w / 2;
        const cy = o.h / 2;
        const sa = ((start - 90) * Math.PI) / 180;
        const ea = ((end - 90) * Math.PI) / 180;
        const large = end - start > 180 ? 1 : 0;
        const x1 = cx + r * Math.cos(sa);
        const y1 = cy + r * Math.sin(sa);
        const x2 = cx + r * Math.cos(ea);
        const y2 = cy + r * Math.sin(ea);
        const color = chartColors[i % chartColors.length];
        if (chartType === 'doughnut') {
          const r2 = r * 0.6;
          const x3 = cx + r2 * Math.cos(sa);
          const y3 = cy + r2 * Math.sin(sa);
          const x4 = cx + r2 * Math.cos(ea);
          const y4 = cy + r2 * Math.sin(ea);
          const path = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x4},${y4} A${r2},${r2} 0 ${large} 0 ${x3},${y3} Z`;
          return `<path d="${path}" fill="${color}"/>`;
        }
        const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
        return `<path d="${path}" fill="${color}"/>`;
      });
      return arcs.join('\n');
    }
    case 'bar':
    case 'column': {
      const bars = series.map((v, i) => {
        const bw = (cw / series.length) * 0.7;
        const x = pad + (cw / series.length) * i + (cw / series.length) * 0.15;
        const h = (v / max) * ch;
        const color = chartColors[i % chartColors.length];
        return `<rect x="${x}" y="${pad + ch - h}" width="${bw}" height="${h}" rx="3" fill="${color}"/>`;
      });
      const labelsSvg = labels
        .map(
          (l, i) =>
            `<text x="${pad + (cw / series.length) * i + cw / series.length / 2}" y="${o.h - 2}" font-size="10" fill="${colors.muted}" text-anchor="middle">${esc(l)}</text>`,
        )
        .join('');
      return bars.join('\n') + labelsSvg;
    }
    case 'line':
    case 'area': {
      const pts = series
        .map((v, i) => {
          const x = pad + (cw / Math.max(series.length - 1, 1)) * i;
          const y = pad + ch - (v / max) * ch;
          return `${x},${y}`;
        })
        .join(' ');
      const color = chartColors[0] ?? colors.primary;
      const line = `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="3"/>`;
      const area =
        chartType === 'area'
          ? `<polygon points="${pad},${pad + ch} ${pts} ${pad + cw},${pad + ch}" fill="${color}" fill-opacity="0.25"/>`
          : '';
      return area + line;
    }
    case 'scatter': {
      const xs = data[0] ?? [];
      const ys = data[1] ?? [];
      const mx = Math.max(...xs, 1);
      const my = Math.max(...ys, 1);
      const dots = xs
        .map((x, i) => {
          const px = pad + (x / mx) * cw;
          const py = pad + ch - (ys[i] / my) * ch;
          return `<circle cx="${px}" cy="${py}" r="5" fill="${colors.primary}"/>`;
        })
        .join('');
      return dots;
    }
    default:
      return '';
  }
};

const tableSvg = (o: TableObject, colors: ThemeColors): string => {
  const colW = o.w / o.cols;
  const rowH = o.h / o.rows;
  const cells: string[] = [];
  for (let r = 0; r < o.rows; r++) {
    for (let c = 0; c < o.cols; c++) {
      const isHeader = r === 0 && o.headerRow;
      const fill = isHeader ? o.headerFill : o.cellFill;
      const color = isHeader ? o.headerColor : colors.text;
      const val = o.data?.[r]?.[c] ?? '';
      const x = c * colW;
      const y = r * rowH;
      cells.push(
        `<rect x="${x}" y="${y}" width="${colW}" height="${rowH}" fill="${fill}" stroke="${colors.muted}" stroke-width="1"/>`,
      );
      cells.push(
        `<text x="${x + colW / 2}" y="${y + rowH / 2 + 4}" font-size="${Math.min(16, rowH * 0.4)}" fill="${color}" text-anchor="middle">${esc(val)}</text>`,
      );
    }
  }
  return cells.join('\n');
};

const diagramSvg = (o: DiagramObject, colors: ThemeColors): string => {
  const { diagramType, items, color } = o;
  const n = Math.max(items.length, 1);
  const boxW = diagramType === 'hierarchy' ? 120 : 160;
  const boxH = diagramType === 'hierarchy' ? 50 : 56;

  if (diagramType === 'hierarchy') {
    const parts: string[] = [];
    const colW = o.w / n;
    items.forEach((item, i) => {
      const x = colW * i + (colW - boxW) / 2;
      const y = o.h / 2 - boxH / 2;
      parts.push(
        `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="8" fill="${color}"/>`,
      );
      parts.push(
        `<text x="${x + boxW / 2}" y="${y + boxH / 2 + 5}" font-size="12" fill="#fff" text-anchor="middle">${esc(item)}</text>`,
      );
      if (i < n - 1) {
        const fromX = x + boxW + colW / 2;
        parts.push(
          `<line x1="${x + boxW}" y1="${o.h / 2}" x2="${x + boxW + colW}" y2="${o.h / 2}" stroke="${color}" stroke-width="2"/>`,
        );
        void fromX;
      }
    });
    return parts.join('\n');
  }

  if (diagramType === 'process' || diagramType === 'cycle') {
    const parts: string[] = [];
    const gap = 14;
    const bw = (o.w - gap * (n - 1)) / n;
    const bh = Math.min(56, o.h * 0.5);
    const y = o.h / 2 - bh / 2;
    items.forEach((item, i) => {
      const x = i * (bw + gap);
      parts.push(`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10" fill="${color}"/>`);
      parts.push(
        `<text x="${x + bw / 2}" y="${y + bh / 2 + 5}" font-size="13" fill="#fff" text-anchor="middle">${esc(item)}</text>`,
      );
      if (i < n - 1 && diagramType === 'process') {
        const ax = x + bw + gap / 2;
        parts.push(
          `<polygon points="${ax - 4},${o.h / 2} ${ax + 4},${o.h / 2 - 5} ${ax + 4},${o.h / 2 + 5}" fill="${color}"/>`,
        );
      }
    });
    return parts.join('\n');
  }

  if (diagramType === 'pyramid') {
    const parts: string[] = [];
    const levels = Math.min(n, 6);
    const levelH = o.h / levels;
    const cx = o.w / 2;
    const halfW = o.w / 2;
    let bottom = o.h;
    for (let i = 0; i < levels; i++) {
      const frac = (levels - i) / levels;
      const topHalf = halfW * frac - halfW * (1 / levels);
      const t1 = cx - topHalf;
      const t2 = cx + topHalf;
      const b1 = cx - halfW * frac;
      const b2 = cx + halfW * frac;
      const y0 = bottom - levelH;
      parts.push(
        `<polygon points="${t1},${y0} ${t2},${y0} ${b2},${bottom} ${b1},${bottom}" fill="${withAlpha(color, 0.3 + (0.7 * (levels - i)) / levels)}"/>`,
      );
      bottom = y0;
    }
    return parts.join('\n');
  }

  if (diagramType === 'matrix') {
    const parts: string[] = [];
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const bw = o.w / cols;
    const bh = o.h / rows;
    items.forEach((item, i) => {
      const x = (i % cols) * bw;
      const y = Math.floor(i / cols) * bh;
      parts.push(
        `<rect x="${x + 4}" y="${y + 4}" width="${bw - 8}" height="${bh - 8}" rx="8" fill="${withAlpha(color, 0.35 + (0.65 * i) / n)}"/>`,
      );
      parts.push(
        `<text x="${x + bw / 2}" y="${y + bh / 2 + 5}" font-size="12" fill="#fff" text-anchor="middle">${esc(item)}</text>`,
      );
    });
    return parts.join('\n');
  }

  return '';
};

export const slideToSvg = (slide: Slide, deck: Deck): string => {
  const colors = deck.theme.colors;
  const defs: string[] = [];
  for (const o of slide.objects) {
    if (o.kind === 'shape' && o.fill.type === 'gradient') {
      const f = o.fill;
      const id = `g${Math.round(f.angle)}${f.from.replace('#', '')}${f.to.replace('#', '')}`;
      defs.push(
        `<linearGradient id="${id}" gradientTransform="rotate(${f.angle} 0.5 0.5)"><stop offset="0%" stop-color="${f.from}"/><stop offset="100%" stop-color="${f.to}"/></linearGradient>`,
      );
    }
    if (o.kind === 'image') {
      defs.push(
        `<pattern id="img-${o.src.replace(/[^a-z0-9]/gi, '')}" width="${o.w}" height="${o.h}" patternUnits="userSpaceOnUse"><image href="${o.src}" width="${o.w}" height="${o.h}" preserveAspectRatio="xMidYMid slice"/></pattern>`,
      );
    }
  }
  const body = slide.objects
    .slice()
    .sort((a, b) => a.z - b.z)
    .map((o) => {
      const transform = [
        o.rotation ? `rotate(${o.rotation} ${o.w / 2} ${o.h / 2})` : '',
        o.flipH ? `scale(-1 1) translate(${-o.w} 0)` : '',
        o.flipV ? `scale(1 -1) translate(0 ${-o.h})` : '',
      ].join(' ');
      const g = `<g transform="${transform}" opacity="${o.opacity}">`;
      const content = renderObjectSvg(o, colors);
      return `<g transform="translate(${o.x} ${o.y})">${g}${content}</g>`;
    })
    .join('\n');
  const bg = fillAttrs(slide.background);
  const bgEl =
    slide.background.type === 'solid'
      ? `<rect width="${deck.width}" height="${deck.height}" ${bg}/>`
      : `<rect width="${deck.width}" height="${deck.height}" ${bg}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${deck.width}" height="${deck.height}" viewBox="0 0 ${deck.width} ${deck.height}">${defs.join('')}${bgEl}${body}</svg>`;
};

const renderObjectSvg = (o: SlideObject, colors: ThemeColors): string => {
  switch (o.kind) {
    case 'text':
      return textSvg(o, colors);
    case 'shape':
      return shapeSvg(o, colors);
    case 'chart':
      return chartSvg(o, colors);
    case 'table':
      return tableSvg(o, colors);
    case 'diagram':
      return diagramSvg(o, colors);
    case 'icon':
      return `<text x="${o.w / 2}" y="${o.h / 2}" font-size="${o.h * 0.7}" fill="${o.color}" text-anchor="middle" dominant-baseline="central">${esc('●')}</text>`;
    case 'equation':
      return `<text x="${o.w / 2}" y="${o.h / 2}" font-size="${Math.min(o.w / Math.max(o.latex.length, 4), o.h * 0.6)}" fill="${o.color}" text-anchor="middle" dominant-baseline="central">${esc(o.latex)}</text>`;
    case 'drawing': {
      return o.strokes
        .map(
          (stroke) =>
            `<polyline points="${stroke.map((p) => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="${o.color}" stroke-width="${o.width}" stroke-linecap="round"/>`,
        )
        .join('\n');
    }
    case 'image':
      return `<image href="${o.src}" x="0" y="0" width="${o.w}" height="${o.h}" preserveAspectRatio="xMidYMid slice"/>`;
    case 'media':
      return `<rect width="${o.w}" height="${o.h}" fill="#111827"/>`;
    case 'embed':
      return `<rect width="${o.w}" height="${o.h}" fill="${colors.surface}"/>`;
    default:
      return '';
  }
};

export const exportDeckJson = (deck: Deck): void => {
  downloadText(
    `${deck.title.replace(/\s+/g, '-').toLowerCase()}.keynotes.json`,
    serializeDeckJson(deck),
    'application/json',
  );
};

export const exportPptxMock = (deck: Deck): void => {
  const blob = new Blob(
    [JSON.stringify({ format: 'mock-pptx', deck: serializeDeckJson(deck) }, null, 2)],
    {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },
  );
  downloadBlob(`${deck.title.replace(/\s+/g, '-').toLowerCase()}.pptx`, blob);
};

export const exportSlideSvg = (slide: Slide, deck: Deck, index: number): void => {
  downloadText(
    `${deck.title.replace(/\s+/g, '-').toLowerCase()}-slide-${index + 1}.svg`,
    slideToSvg(slide, deck),
    'image/svg+xml',
  );
};

const loadSvgImage = (svg: string): Promise<HTMLImageElement> => {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const img = new Image();
  img.decoding = 'sync';
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to render slide image'));
    img.src = url;
  });
};

export const exportSlidePng = async (slide: Slide, deck: Deck, index: number): Promise<void> => {
  const img = await loadSvgImage(slideToSvg(slide, deck));
  const canvas = document.createElement('canvas');
  canvas.width = deck.width;
  canvas.height = deck.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(img, 0, 0, deck.width, deck.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (blob) {
    downloadBlob(`${deck.title.replace(/\s+/g, '-').toLowerCase()}-slide-${index + 1}.png`, blob);
  }
};

export const exportDeckPngs = async (deck: Deck): Promise<void> => {
  for (let i = 0; i < deck.slides.length; i++) {
    if (!deck.slides[i].hidden) {
      await exportSlidePng(deck.slides[i], deck, i);
    }
  }
};

export const exportHtml = (deck: Deck): string => {
  const slides = deck.slides
    .filter((s) => !s.hidden)
    .map((s) => `<section class="slide">${slideToSvg(s, deck)}</section>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(deck.title)}</title>
<style>
  html, body { margin: 0; padding: 0; background: #0b0b0b; }
  .slide { width: 100vw; height: 100vh; display: none; align-items: center; justify-content: center; }
  .slide.active { display: flex; }
  .slide svg { width: min(100vw, ${(deck.width / deck.height) * 100}vh); height: 100vh; }
  nav { position: fixed; bottom: 16px; right: 16px; z-index: 10; display: flex; gap: 8px; }
  nav button { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 8px 14px; cursor: pointer; }
</style>
</head>
<body>
${slides}
<nav>
<button onclick="navSlide(-1)">&larr;</button>
<span style="color:#fff;padding:8px" id="count"></span>
<button onclick="navSlide(1)">&rarr;</button>
</nav>
<script>
let i = 0; const slides = document.querySelectorAll('.slide'); const count = document.getElementById('count');
function show() { slides.forEach((s, n) => s.classList.toggle('active', n === i)); count.textContent = (i+1) + ' / ' + slides.length; }
function navSlide(d) { i = Math.max(0, Math.min(slides.length - 1, i + d)); show(); }
document.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === ' ') navSlide(1); if (e.key === 'ArrowLeft') navSlide(-1); });
show();
</script>
</body>
</html>`;
};

export const exportHtmlFile = (deck: Deck): void => {
  downloadText(
    `${deck.title.replace(/\s+/g, '-').toLowerCase()}.html`,
    exportHtml(deck),
    'text/html',
  );
};

const svgInner = (svg: string): string => {
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  return match ? match[1] : '';
};

export const slideStorySvg = (deck: Deck): string => {
  const visible = deck.slides.filter((s) => !s.hidden);
  const total = visible.length * deck.height;
  const slides = visible
    .map(
      (s, i) =>
        `<svg x="0" y="${i * deck.height}" width="${deck.width}" height="${deck.height}" viewBox="0 0 ${deck.width} ${deck.height}">${svgInner(slideToSvg(s, deck))}</svg>`,
    )
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${deck.width}" height="${total}" viewBox="0 0 ${deck.width} ${total}">${slides}</svg>`;
};

export const exportDeckStorySvg = (deck: Deck): void => {
  downloadText(
    `${deck.title.replace(/\s+/g, '-').toLowerCase()}-story.svg`,
    slideStorySvg(deck),
    'image/svg+xml',
  );
};

export const exportDeckStoryPng = async (deck: Deck): Promise<void> => {
  const visible = deck.slides.filter((s) => !s.hidden);
  const canvas = document.createElement('canvas');
  canvas.width = deck.width;
  canvas.height = deck.height * visible.length;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  for (let i = 0; i < visible.length; i++) {
    const img = await loadSvgImage(slideToSvg(visible[i], deck));
    ctx.drawImage(img, 0, i * deck.height, deck.width, deck.height);
  }
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (blob) {
    downloadBlob(`${deck.title.replace(/\s+/g, '-').toLowerCase()}-story.png`, blob);
  }
};

export const serializeThemeFile = (deck: Deck): string =>
  JSON.stringify(
    {
      format: 'keynotes-theme',
      name: deck.theme.name,
      colors: deck.theme.colors,
      fontFamily: deck.theme.fontFamily,
      fontSize: deck.theme.fontSize,
      width: deck.width,
      height: deck.height,
    },
    null,
    2,
  );

export const exportThemeFile = (deck: Deck): void => {
  downloadText(
    `${deck.title.replace(/\s+/g, '-').toLowerCase()}-theme.json`,
    serializeThemeFile(deck),
    'application/json',
  );
};
