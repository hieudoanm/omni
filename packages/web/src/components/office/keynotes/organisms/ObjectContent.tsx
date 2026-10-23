'use client';

import { type CSSProperties, type FC, type ReactNode } from 'react';
import type {
  ChartObject,
  DiagramObject,
  FillStyle,
  FontFamily,
  ShapeEffect,
  ShapeObject,
  SlideObject,
  TableObject,
  TextObject,
  TextStyle,
} from '@/types/keynotes/deck';
import { FONT_FAMILY_MAP } from '@/types/keynotes/deck';
import { shapePath } from '@/lib/office/keynotes/shapes';
import { readableTextColor, withAlpha } from '@/lib/office/keynotes/color';
import { ICON_MAP } from '@/data/office/keynotes/icons';
import { clamp } from '@/lib/office/keynotes/geometry';
import { highlightCode } from '@/lib/office/keynotes/highlight';

export const FONT_CLASS: Record<FontFamily, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  playfair: 'font-serif',
  'space-grotesk': 'font-sans',
};

export const textStyleCss = (s: TextStyle): CSSProperties => ({
  fontFamily: FONT_FAMILY_MAP[s.fontFamily],
  fontSize: s.fontSize,
  color: s.color,
  fontWeight: s.bold ? 700 : 400,
  fontStyle: s.italic ? 'italic' : 'normal',
  textDecoration:
    `${s.underline ? 'underline ' : ''}${s.strikethrough ? 'line-through' : ''}`.trim(),
  lineHeight: s.lineHeight,
  letterSpacing: `${s.letterSpacing}px`,
  textAlign: s.align,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  backgroundColor: s.highlight ?? 'transparent',
});

export const bulletLines = (text: string, numbered: boolean): string[] =>
  text.split('\n').map((line, i) => {
    if (!line.trim()) return line;
    return numbered ? `${i + 1}. ${line}` : `• ${line}`;
  });

export const VerticalAlignStyle: Record<TextStyle['vertical'], CSSProperties> = {
  top: { justifyContent: 'flex-start' },
  middle: { justifyContent: 'center' },
  bottom: { justifyContent: 'flex-end' },
};

const fillCss = (obj: { fill?: FillStyle }): CSSProperties | undefined => {
  const fill = obj.fill;
  if (!fill || fill.type === 'none') return undefined;
  if (fill.type === 'solid') {
    return {
      backgroundColor: fill.color,
      opacity: clamp(fill.opacity, 0, 1),
    };
  }
  if (fill.type === 'gradient') {
    const stops =
      fill.stops && fill.stops.length >= 2
        ? fill.stops
        : [
            { color: fill.from, offset: 0 },
            { color: fill.to, offset: 1 },
          ];
    const spec = stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ');
    return {
      background: `linear-gradient(${fill.angle}deg, ${spec})`,
      opacity: clamp(fill.opacity, 0, 1),
    };
  }
  if (fill.type === 'image') {
    return {
      backgroundImage: `url("${fill.imageUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: clamp(fill.opacity, 0, 1),
    };
  }
  if (fill.type === 'pattern') {
    const bg =
      fill.pattern === 'dots'
        ? `radial-gradient(circle, ${fill.color} 2px, transparent 2px)`
        : fill.pattern === 'grid'
          ? `linear-gradient(${fill.color} 1px, transparent 1px), linear-gradient(90deg, ${fill.color} 1px, transparent 1px)`
          : `repeating-linear-gradient(45deg, ${fill.color} 0 6px, transparent 6px 12px)`;
    return {
      backgroundColor: 'transparent',
      backgroundImage: bg,
      backgroundSize: fill.pattern === 'dots' ? '12px 12px' : '24px 24px',
    };
  }
  return undefined;
};

const strokeCss = (o: {
  stroke: { color: string; width: number; dash: string };
}): CSSProperties => {
  if (o.stroke.width <= 0 || o.stroke.color === 'transparent') return {};
  return {
    border: `${o.stroke.width}px ${o.stroke.dash === 'solid' ? 'solid' : o.stroke.dash} ${o.stroke.color}`,
  };
};

const gradientStops = (fill: Extract<FillStyle, { type: 'gradient' }>) =>
  fill.stops && fill.stops.length >= 2
    ? fill.stops
    : [
        { color: fill.from, offset: 0 },
        { color: fill.to, offset: 1 },
      ];

const effectCss = (o: {
  fill?: FillStyle;
  shadow: ShapeObject['shadow'];
  effect?: ShapeEffect;
}): CSSProperties => {
  const shadows: string[] = [];
  if (o.shadow.enabled) {
    shadows.push(
      `${o.shadow.offsetX}px ${o.shadow.offsetY}px ${o.shadow.blur}px ${o.shadow.color}`,
    );
  }
  if (o.effect?.glowColor && o.effect.glowBlur) {
    shadows.push(`0 0 ${o.effect.glowBlur}px ${o.effect.glowColor}`);
  }
  if (o.effect?.softEdges && o.fill?.type === 'solid') {
    shadows.push(`0 0 ${o.effect.softEdges}px ${withAlpha(o.fill.color, 0.35)}`);
  }
  return {
    boxShadow: shadows.length > 0 ? shadows.join(', ') : undefined,
    WebkitBoxReflect: o.effect?.reflection
      ? 'below 4px linear-gradient(transparent, rgba(255,255,255,0.25))'
      : undefined,
    borderTop: o.effect?.bevel ? '1px solid rgba(255,255,255,0.3)' : undefined,
    borderBottom: o.effect?.bevel ? '1px solid rgba(0,0,0,0.35)' : undefined,
  };
};

const shapeFilters = (obj: ShapeObject): { defs: ReactNode; filter: string | undefined } => {
  const { shadow, effect } = obj;
  const glow =
    effect?.glowColor && effect.glowBlur
      ? { color: effect.glowColor, blur: effect.glowBlur }
      : null;
  const soft = effect?.softEdges ?? 0;
  const hasDrop = Boolean(glow) || shadow.enabled;
  if (!hasDrop && !soft) return { defs: null, filter: undefined };
  if (soft && !hasDrop) return { defs: null, filter: `blur(${soft}px)` };
  return {
    defs: (
      <filter id={`fx-${obj.id}`}>
        {glow && (
          <feDropShadow
            dx='0'
            dy='0'
            stdDeviation={glow.blur / 2}
            floodColor={glow.color}
            floodOpacity='0.8'
          />
        )}
        {shadow.enabled && (
          <feDropShadow
            dx={shadow.offsetX}
            dy={shadow.offsetY}
            stdDeviation={shadow.blur / 2}
            floodColor={shadow.color}
            floodOpacity='0.5'
          />
        )}
      </filter>
    ),
    filter: `url(#fx-${obj.id})`,
  };
};

export const ShapeContent: FC<{
  obj: Extract<SlideObject, { kind: 'shape' }>;
}> = ({ obj }) => {
  const fill = fillCss(obj as never) ?? { backgroundColor: 'transparent' };
  const stroke = strokeCss(obj as never);
  const effect = effectCss(obj as never);
  const useDiv = obj.shapeType === 'rect' || obj.shapeType === 'rounded-rect';
  const arrowStart = obj.shapeType === 'line' && obj.stroke.arrowStart;
  const arrowEnd = obj.shapeType === 'line' && obj.stroke.arrowEnd;

  if (useDiv) {
    return (
      <div
        className='h-full w-full'
        style={{
          ...fill,
          ...stroke,
          ...effect,
          borderRadius: obj.shapeType === 'rounded-rect' ? obj.cornerRadius : 0,
        }}
      />
    );
  }

  const path = shapePath(obj.shapeType);
  const { defs, filter } = shapeFilters(obj);

  return (
    <svg
      className='h-full w-full'
      viewBox='0 0 100 100'
      preserveAspectRatio='none'
      style={{ overflow: 'visible' }}>
      <defs>
        {obj.fill.type === 'gradient' && (
          <linearGradient
            id={`grad-${obj.id}`}
            gradientTransform={`rotate(${obj.fill.angle} 0.5 0.5)`}>
            {gradientStops(obj.fill).map((s, i) => (
              <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} />
            ))}
          </linearGradient>
        )}
        {arrowStart && (
          <marker
            id={`ast-${obj.id}`}
            markerWidth='10'
            markerHeight='10'
            refX='2'
            refY='3'
            orient='auto'>
            <path d='M0,0 L0,6 L9,3 z' fill={obj.stroke.color} />
          </marker>
        )}
        {arrowEnd && (
          <marker
            id={`aen-${obj.id}`}
            markerWidth='10'
            markerHeight='10'
            refX='9'
            refY='3'
            orient='auto'>
            <path d='M0,0 L9,3 L0,6 z' fill={obj.stroke.color} />
          </marker>
        )}
        {defs}
      </defs>
      {obj.shapeType === 'line' ? (
        <line
          x1='0'
          y1='50'
          x2='100'
          y2='50'
          stroke={obj.stroke.color}
          strokeWidth={obj.stroke.width || 4}
          strokeDasharray={
            obj.stroke.dash === 'solid' ? undefined : obj.stroke.dash === 'dashed' ? '8 6' : '3 4'
          }
          strokeLinecap='round'
          markerStart={arrowStart ? `url(#ast-${obj.id})` : undefined}
          markerEnd={arrowEnd ? `url(#aen-${obj.id})` : undefined}
        />
      ) : (
        <path
          d={path}
          fill={
            obj.fill.type === 'gradient'
              ? `url(#grad-${obj.id})`
              : obj.fill.type === 'solid'
                ? obj.fill.color
                : obj.fill.type === 'none'
                  ? 'none'
                  : 'transparent'
          }
          fillOpacity={
            obj.fill.type === 'solid' || obj.fill.type === 'gradient'
              ? clamp(obj.fill.opacity, 0, 1)
              : undefined
          }
          stroke={obj.stroke.color !== 'transparent' ? obj.stroke.color : 'none'}
          strokeWidth={obj.stroke.width || 0}
          strokeDasharray={
            obj.stroke.dash === 'solid' ? undefined : obj.stroke.dash === 'dashed' ? '8 6' : '3 4'
          }
          filter={filter}
        />
      )}
    </svg>
  );
};

export const TextContent: FC<{ obj: TextObject; editing?: boolean }> = ({ obj, editing }) => {
  const style = textStyleCss(obj.style);
  const { script, columns, transform } = obj.style;
  const lines =
    obj.style.bullet || obj.style.numbered ? bulletLines(obj.text, obj.style.numbered) : null;
  const fill =
    obj.fill && obj.fill.type === 'solid'
      ? { backgroundColor: obj.fill.color, opacity: obj.fill.opacity }
      : undefined;
  const scriptStyle: CSSProperties | undefined =
    script === 'sub' || script === 'sup'
      ? {
          display: 'inline-block',
          fontSize: obj.style.fontSize * 0.65,
          transform: script === 'sub' ? 'translateY(0.4em)' : 'translateY(-0.4em)',
        }
      : undefined;
  const transformCss: CSSProperties =
    transform === 'tilt'
      ? { transform: 'rotate(-6deg)' }
      : transform === 'rotate-cw'
        ? { transform: 'rotate(90deg)' }
        : transform === 'rotate-ccw'
          ? { transform: 'rotate(-90deg)' }
          : {};
  const waveStyle = (i: number): CSSProperties =>
    transform === 'wave' && i % 2 === 1
      ? { transform: 'translateY(0.25em) skewX(-8deg)', opacity: 0.85 }
      : {};

  let content: ReactNode;
  if (transform === 'arc' && !editing) {
    content = (
      <svg
        className='h-full w-full'
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
        style={{ overflow: 'visible' }}>
        <path id={`arc-${obj.id}`} d='M 8 68 Q 50 6 92 68' fill='none' />
        <text
          fill={obj.style.color}
          fontFamily={FONT_FAMILY_MAP[obj.style.fontFamily]}
          fontSize={(obj.style.fontSize / Math.max(obj.w, 1)) * 100}
          fontWeight={obj.style.bold ? 700 : 400}
          fontStyle={obj.style.italic ? 'italic' : 'normal'}>
          <textPath href={`#arc-${obj.id}`}>{obj.text}</textPath>
        </text>
      </svg>
    );
  } else {
    const pieces = lines ?? obj.text.split('\n');
    const columnStyle: CSSProperties = {
      columnCount: columns && columns > 1 ? columns : undefined,
      columnGap: obj.style.columnGap,
    };
    if (transform === 'wave') {
      content = (
        <div className='w-full' style={columnStyle}>
          {pieces.map((p, i) => (
            <div key={i} style={waveStyle(i)}>
              {scriptStyle ? <span style={scriptStyle}>{p}</span> : p}
            </div>
          ))}
        </div>
      );
    } else {
      const text = lines ? pieces.join('\n') : obj.text;
      content = (
        <div className='w-full' style={{ ...columnStyle, ...transformCss }}>
          {scriptStyle ? <span style={scriptStyle}>{text}</span> : text}
        </div>
      );
    }
  }

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden px-2 py-1 ${FONT_CLASS[obj.style.fontFamily]} ${editing ? 'cursor-text outline-none' : 'pointer-events-none select-none'}`}
      style={{
        ...style,
        ...VerticalAlignStyle[obj.style.vertical],
        ...fill,
      }}>
      {content}
    </div>
  );
};

export const ChartContent: FC<{ obj: ChartObject }> = ({ obj }) => {
  const { chartType, data, labels, colors } = obj;
  const series = data[0] ?? [];
  const max = Math.max(...series, 1);
  const chartColors = colors.length > 0 ? colors : ['#6366f1'];

  return (
    <div className='flex h-full w-full flex-col p-2'>
      <svg className='min-h-0 w-full flex-1' preserveAspectRatio='none' viewBox='0 0 100 100'>
        {chartType === 'bar' || chartType === 'column'
          ? series.map((v, i) => {
              const bw = (100 / series.length) * 0.6;
              const x = (100 / series.length) * i + (100 / series.length) * 0.2;
              const h = (v / max) * 90;
              return (
                <rect
                  key={i}
                  x={x}
                  y={90 - h + 2}
                  width={bw}
                  height={h}
                  rx='2'
                  fill={chartColors[i % chartColors.length]}
                />
              );
            })
          : chartType === 'line' || chartType === 'area'
            ? (() => {
                const pts = series
                  .map((v, i) => {
                    const x = (100 / Math.max(series.length - 1, 1)) * i;
                    const y = 90 - (v / max) * 85;
                    return `${x},${y}`;
                  })
                  .join(' ');
                const color = chartColors[0];
                return (
                  <>
                    {chartType === 'area' && (
                      <polygon points={`0,92 ${pts} 100,92`} fill={color} opacity='0.25' />
                    )}
                    <polyline points={pts} fill='none' stroke={color} strokeWidth='2.5' />
                    {series.map((v, i) => {
                      const x = (100 / Math.max(series.length - 1, 1)) * i;
                      const y = 90 - (v / max) * 85;
                      return <circle key={i} cx={x} cy={y} r='2' fill={color} />;
                    })}
                  </>
                );
              })()
            : chartType === 'scatter'
              ? (data[1] ?? []).map((y, i) => {
                  const x = ((data[0]?.[i] ?? 0) / Math.max(...(data[0] ?? [1]), 1)) * 95 + 2;
                  const py = 90 - (y / Math.max(...(data[1] ?? [1]), 1)) * 85;
                  return <circle key={i} cx={x} cy={py} r='3' fill={chartColors[0]} />;
                })
              : (() => {
                  const total = series.reduce((s, v) => s + v, 0) || 1;
                  let acc = 0;
                  const r = 42;
                  const cx = 50;
                  const cy = 50;
                  const r2 = chartType === 'doughnut' ? 26 : 0;
                  const arcs = series.map((v, i) => {
                    const start = (acc / total) * 360;
                    acc += v;
                    const end = (acc / total) * 360;
                    const sa = ((start - 90) * Math.PI) / 180;
                    const ea = ((end - 90) * Math.PI) / 180;
                    const large = end - start > 180 ? 1 : 0;
                    const x1 = cx + r * Math.cos(sa);
                    const y1 = cy + r * Math.sin(sa);
                    const x2 = cx + r * Math.cos(ea);
                    const y2 = cy + r * Math.sin(ea);
                    const color = chartColors[i % chartColors.length];
                    if (r2 > 0) {
                      const x3 = cx + r2 * Math.cos(sa);
                      const y3 = cy + r2 * Math.sin(sa);
                      const x4 = cx + r2 * Math.cos(ea);
                      const y4 = cy + r2 * Math.sin(ea);
                      return (
                        <path
                          key={i}
                          d={`M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x4},${y4} A${r2},${r2} 0 ${large} 0 ${x3},${y3} Z`}
                          fill={color}
                        />
                      );
                    }
                    return (
                      <path
                        key={i}
                        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
                        fill={color}
                      />
                    );
                  });
                  return arcs;
                })()}
      </svg>
      {obj.showLegend && (
        <div className='flex flex-wrap gap-2 pt-1'>
          {labels.map((l, i) => (
            <span key={i} className='flex items-center gap-1 text-[10px] opacity-80'>
              <span
                className='inline-block size-2 rounded-full'
                style={{ backgroundColor: chartColors[i % chartColors.length] }}
              />
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const TableContent: FC<{ obj: TableObject }> = ({ obj }) => {
  const cols = Math.max(obj.cols, 1);
  const rows = Math.max(obj.rows, 1);
  return (
    <table className='h-full w-full border-collapse text-xs'>
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }, (_, c) => {
              const isHeader = r === 0 && obj.headerRow;
              return (
                <td
                  key={c}
                  className='border px-1 text-center'
                  style={{
                    backgroundColor: isHeader ? obj.headerFill : obj.cellFill,
                    color: isHeader ? obj.headerColor : 'inherit',
                    borderColor: 'rgba(128,128,128,0.4)',
                    fontWeight: isHeader ? 600 : 400,
                  }}>
                  {obj.data?.[r]?.[c] ?? ''}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const DiagramContent: FC<{ obj: DiagramObject }> = ({ obj }) => {
  const { diagramType, items, color } = obj;
  const n = Math.max(items.length, 1);

  if (diagramType === 'hierarchy') {
    return (
      <div className='flex h-full w-full items-center gap-1'>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex min-h-0 flex-1 items-center justify-center rounded-lg px-1 text-center text-[11px] font-medium text-white'
            style={{ backgroundColor: color, minWidth: 0 }}>
            <span className='truncate'>{item}</span>
          </div>
        ))}
      </div>
    );
  }

  if (diagramType === 'process' || diagramType === 'cycle') {
    return (
      <div className='flex h-full w-full flex-col justify-center gap-1.5'>
        {items.map((item, i) => (
          <div key={i} className='flex items-center gap-1.5'>
            <div
              className='flex flex-1 items-center justify-center rounded-lg py-1 text-center text-[11px] font-medium text-white'
              style={{
                backgroundColor: color,
                opacity: 0.35 + (0.65 * (i + 1)) / n,
              }}>
              <span className='truncate'>{item}</span>
            </div>
            {diagramType === 'process' && i < n - 1 && (
              <span className='text-[10px] font-bold' style={{ color }}>
                →
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (diagramType === 'matrix') {
    const cols = Math.ceil(Math.sqrt(n));
    return (
      <div
        className='grid h-full w-full gap-1'
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex items-center justify-center rounded-lg px-1 text-center text-[11px] font-medium text-white'
            style={{ backgroundColor: withAlpha(color, 0.3 + (0.7 * i) / n) }}>
            <span className='truncate'>{item}</span>
          </div>
        ))}
      </div>
    );
  }

  if (diagramType === 'pyramid') {
    return (
      <div className='flex h-full w-full flex-col justify-end'>
        {items.slice(0, 6).map((item, i) => {
          const level = items.length - i;
          return (
            <div
              key={i}
              className='flex items-center justify-center overflow-hidden text-center text-[10px] font-medium text-white'
              style={{
                height: `${100 / Math.min(items.length, 6)}%`,
                margin: '0 auto',
                width: `${(level / Math.min(items.length, 6)) * 100}%`,
                backgroundColor: withAlpha(
                  color,
                  0.3 + (0.7 * (i + 1)) / Math.min(items.length, 6),
                ),
                clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
              }}>
              <span className='pt-2'>{item}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export const ObjectContent: FC<{ obj: SlideObject; editing?: boolean }> = ({ obj, editing }) => {
  switch (obj.kind) {
    case 'text':
      return <TextContent obj={obj} editing={editing} />;
    case 'shape':
      return (
        <div
          className='relative h-full w-full'
          style={{
            WebkitBoxReflect: obj.effect?.reflection
              ? 'below 4px linear-gradient(transparent, rgba(255,255,255,0.25))'
              : undefined,
          }}>
          <div className='absolute inset-0'>
            <ShapeContent obj={obj} />
          </div>
          {obj.text && obj.text.trim() && (
            <div
              className='absolute inset-0 flex items-center justify-center overflow-hidden px-2 text-center'
              style={textStyleCss(obj.style ?? defaultShapeStyle)}>
              <span>{obj.text}</span>
            </div>
          )}
        </div>
      );
    case 'chart':
      return <ChartContent obj={obj} />;
    case 'table':
      return <TableContent obj={obj} />;
    case 'diagram':
      return <DiagramContent obj={obj} />;
    case 'icon': {
      const Icon = ICON_MAP[obj.icon] ?? ICON_MAP.star;
      return (
        <div
          className='flex h-full w-full items-center justify-center'
          style={{ color: obj.color }}>
          <Icon className='h-full w-full' />
        </div>
      );
    }
    case 'equation':
      return (
        <div
          className='flex h-full w-full items-center justify-center font-serif italic'
          style={{
            color: obj.color,
            fontSize: `min(${obj.h * 0.5}px, ${obj.w / Math.max(obj.latex.length, 4)}px)`,
          }}>
          {obj.latex}
        </div>
      );
    case 'drawing':
      return (
        <svg className='h-full w-full' viewBox={`0 0 ${obj.w} ${obj.h}`} preserveAspectRatio='none'>
          {obj.strokes.map((stroke, i) => (
            <polyline
              key={i}
              points={stroke.map((p) => `${p.x},${p.y}`).join(' ')}
              fill='none'
              stroke={obj.color}
              strokeWidth={obj.width}
              strokeLinecap='round'
            />
          ))}
        </svg>
      );
    case 'image':
      return (
        <img
          src={obj.src}
          alt={obj.alt}
          className='h-full w-full object-cover'
          style={{
            borderRadius: obj.corners,
            border:
              obj.border && obj.border.width > 0
                ? `${obj.border.width}px ${obj.border.dash === 'solid' ? 'solid' : obj.border.dash} ${obj.border.color}`
                : undefined,
          }}
          draggable={false}
        />
      );
    case 'media':
      return (
        <div className='flex h-full w-full items-center justify-center rounded-lg bg-black'>
          {obj.mime === 'video' ? (
            <video src={obj.src} controls={!editing} className='h-full w-full' draggable={false} />
          ) : (
            <audio src={obj.src} controls={!editing} className='w-full' />
          )}
        </div>
      );
    case 'embed':
      if (obj.embedType === 'code') {
        return (
          <pre className='h-full w-full overflow-auto rounded-lg bg-neutral-900 p-3 text-xs'>
            <code>{highlightCode(obj.code ?? '', obj.language)}</code>
          </pre>
        );
      }
      if (obj.embedType === 'youtube') {
        const id = obj.url ? (new URL(obj.url).searchParams.get('v') ?? obj.url) : '';
        return (
          <div className='flex h-full w-full items-center justify-center rounded-lg bg-neutral-900 text-xs text-white/60'>
            {id ? `YouTube embed: ${id}` : 'YouTube URL'}
          </div>
        );
      }
      return (
        <div className='flex h-full w-full items-center justify-center rounded-lg bg-neutral-900 text-xs text-white/60'>
          {obj.mermaid ?? 'Mermaid diagram'}
        </div>
      );
    case 'group':
      return null;
    default:
      return null;
  }
};

const defaultShapeStyle: TextStyle = {
  fontFamily: 'sans',
  fontSize: 18,
  color: readableTextColor('#6366f1'),
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  lineHeight: 1.3,
  letterSpacing: 0,
  align: 'center',
  bullet: false,
  numbered: false,
  vertical: 'middle',
};
