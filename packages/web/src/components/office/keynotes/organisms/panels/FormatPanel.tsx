'use client';

import { type FC, useMemo, useState } from 'react';
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiArrowLeft,
  FiArrowUp,
  FiBold,
  FiCheck,
  FiCopy,
  FiItalic,
  FiLink,
  FiRotateCcw,
  FiRotateCw,
  FiType,
  FiUnderline,
} from 'react-icons/fi';
import type { FillStyle, Hyperlink, SlideObject, TextStyle } from '@/types/keynotes/deck';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { IconButton } from '@/components/office/keynotes/atoms/IconButton';
import {
  ColorInput,
  EyeDropperButton,
  NumberInput,
  PanelSection,
  SelectInput,
  TextArea,
  Toggle,
} from '@/components/office/keynotes/atoms/FormControls';
import { CODE_LANGUAGES } from '@/lib/office/keynotes/highlight';
import { FONT_FAMILY_MAP } from '@/types/keynotes/deck';
import { FONT_OPTIONS } from '@/data/office/keynotes/themes';
import { textStyleCss } from '@/components/office/keynotes/organisms/ObjectContent';
import { SHAPE_PRESETS } from '@/data/office/keynotes/presets';

const ALIGN_ICONS = [
  { value: 'left', icon: FiAlignLeft },
  { value: 'center', icon: FiAlignCenter },
  { value: 'right', icon: FiAlignRight },
] as const;

const TEXT_TRANSFORMS = [
  { value: 'none', label: 'None' },
  { value: 'tilt', label: 'Tilt' },
  { value: 'wave', label: 'Wave' },
  { value: 'arc', label: 'Arc' },
  { value: 'rotate-cw', label: 'Rotate 90° CW' },
  { value: 'rotate-ccw', label: 'Rotate 90° CCW' },
] as const;

const COPYABLE_KEYS = ['fill', 'stroke', 'shadow', 'effect', 'style', 'cornerRadius'] as const;

const copyFormat = (o: SlideObject): Partial<SlideObject> => {
  const out: Partial<SlideObject> = {};
  for (const k of COPYABLE_KEYS) {
    const v = (o as unknown as Record<string, unknown>)[k];
    if (v !== undefined)
      (out as unknown as Record<string, unknown>)[k] = JSON.parse(JSON.stringify(v));
  }
  return out;
};

const GradientStopsEditor: FC<{
  fill: Extract<FillStyle, { type: 'gradient' }>;
  onChange: (stops: Array<{ color: string; offset: number }>) => void;
  onAngle: (angle: number) => void;
}> = ({ fill, onChange, onAngle }) => {
  const stops = fill.stops ?? [
    { color: fill.from, offset: 0 },
    { color: fill.to, offset: 1 },
  ];
  return (
    <>
      <div className='flex items-center gap-1'>
        <ColorInput
          label='From'
          value={fill.from}
          onChange={(c) => onChange([{ color: c, offset: 0 }, ...stops.slice(1)])}
        />
        <ColorInput
          label='To'
          value={fill.to}
          onChange={(c) => onChange([...stops.slice(0, -1), { color: c, offset: 1 }])}
        />
      </div>
      {stops.map((s, i) => (
        <div key={i} className='flex items-center gap-1'>
          <ColorInput
            label={`Stop ${i + 1}`}
            value={s.color}
            swatches={false}
            onChange={(c) => onChange(stops.map((x, j) => (j === i ? { ...x, color: c } : x)))}
          />
          <NumberInput
            label='%'
            value={Math.round(s.offset * 100)}
            min={0}
            max={100}
            onChange={(v) =>
              onChange(stops.map((x, j) => (j === i ? { ...x, offset: v / 100 } : x)))
            }
          />
          <button
            type='button'
            className='btn btn-ghost btn-xs'
            onClick={() => onChange(stops.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button
        type='button'
        className='btn btn-outline btn-xs w-fit'
        onClick={() => onChange([...stops, { color: '#ffffff', offset: 0.5 }])}>
        Add stop
      </button>
      <NumberInput label='Angle' value={fill.angle} min={0} max={360} onChange={onAngle} />
    </>
  );
};

export const FormatPanel: FC = () => {
  const { activeSlide, currentDeck, selectedObjectIds, updateObject, setDeckSize } = useDeck();

  const selected = useMemo(
    () => activeSlide?.objects.find((o) => selectedObjectIds.includes(o.id)),
    [activeSlide, selectedObjectIds],
  );

  const [paintbrush, setPaintbrush] = useState<Partial<SlideObject> | null>(null);

  if (!selected) {
    return (
      <div className='px-4 py-6 text-center text-xs opacity-50'>Select an object to format it</div>
    );
  }

  const patch = (p: Partial<SlideObject>) => updateObject(selected.id, p);
  const patchLink = (p: Partial<Hyperlink>) =>
    patch({
      link: { ...(selected.link ?? { type: 'url' as const }), ...p },
    } as unknown as Partial<SlideObject>);
  const style =
    selected.kind === 'text'
      ? selected.style
      : selected.kind === 'shape'
        ? selected.style
        : undefined;
  const stylePatch = (p: Partial<TextStyle>) =>
    style && patch({ style: { ...style, ...p } } as Partial<SlideObject>);
  const isShape = selected.kind === 'shape' || selected.kind === 'text';
  const patchFill = (p: Partial<FillStyle>) =>
    patch({
      fill: {
        ...(selected as unknown as { fill?: FillStyle }).fill,
        ...p,
      } as FillStyle,
    } as Partial<SlideObject>);
  const applyPreset = (i: number) => {
    const preset = SHAPE_PRESETS[i];
    const next: Partial<SlideObject> = {};
    if (preset.fill)
      (next as Record<string, unknown>).fill = JSON.parse(JSON.stringify(preset.fill));
    if (preset.stroke)
      (next as Record<string, unknown>).stroke = JSON.parse(JSON.stringify(preset.stroke));
    if (preset.shadow)
      (next as Record<string, unknown>).shadow = JSON.parse(JSON.stringify(preset.shadow));
    if (preset.effect)
      (next as Record<string, unknown>).effect = JSON.parse(JSON.stringify(preset.effect));
    patch(next);
  };

  return (
    <div className='text-base-content'>
      <div className='border-base-300 flex items-center justify-between border-b px-3 py-2'>
        <span className='truncate text-xs font-medium opacity-80'>{selected.name}</span>
        <input
          type='text'
          value={selected.name}
          onChange={(e) => patch({ name: e.target.value } as Partial<SlideObject>)}
          className='input input-xs input-bordered w-28'
          placeholder='Name'
        />
      </div>

      {isShape && (
        <div className='border-base-300 flex items-center gap-2 border-b px-3 py-2'>
          {paintbrush ? (
            <>
              <FiCheck className='text-primary size-3.5' />
              <span className='truncate text-xs opacity-70'>
                Style copied. Select a target, then apply.
              </span>
              <div className='flex-1' />
              <button
                type='button'
                className='btn btn-ghost btn-xs'
                onClick={() => setPaintbrush(null)}>
                Cancel
              </button>
              <button
                type='button'
                className='btn btn-primary btn-xs gap-1'
                onClick={() => {
                  patch(paintbrush);
                  setPaintbrush(null);
                }}>
                <FiCopy className='size-3' /> Apply
              </button>
            </>
          ) : (
            <>
              <span className='truncate text-xs opacity-70'>Copy object style</span>
              <div className='flex-1' />
              <button
                type='button'
                className='btn btn-ghost btn-xs gap-1'
                onClick={() => setPaintbrush(copyFormat(selected))}>
                <FiCopy className='size-3' /> Pick
              </button>
            </>
          )}
        </div>
      )}

      {selected.kind === 'text' && style && (
        <PanelSection title='Text'>
          <div className='flex flex-col gap-2'>
            <SelectInput
              label='Font'
              value={style.fontFamily}
              options={FONT_OPTIONS.map((f) => ({
                value: f.id,
                label: f.label,
              }))}
              onChange={(v) => stylePatch({ fontFamily: v as TextStyle['fontFamily'] })}
            />
            <div className='flex items-center gap-2'>
              <NumberInput
                label='Size'
                value={style.fontSize}
                min={8}
                max={300}
                onChange={(v) => stylePatch({ fontSize: v })}
              />
              <div className='flex items-center gap-0.5'>
                <IconButton
                  icon={FiBold}
                  label='Bold'
                  size='sm'
                  active={style.bold}
                  onClick={() => stylePatch({ bold: !style.bold })}
                />
                <IconButton
                  icon={FiItalic}
                  label='Italic'
                  size='sm'
                  active={style.italic}
                  onClick={() => stylePatch({ italic: !style.italic })}
                />
                <IconButton
                  icon={FiUnderline}
                  label='Underline'
                  size='sm'
                  active={style.underline}
                  onClick={() => stylePatch({ underline: !style.underline })}
                />
                <IconButton
                  icon={FiType}
                  label='Strikethrough'
                  size='sm'
                  active={style.strikethrough}
                  onClick={() => stylePatch({ strikethrough: !style.strikethrough })}
                />
                <button
                  type='button'
                  onClick={() =>
                    stylePatch({
                      script: style.script === 'sub' ? 'none' : 'sub',
                    })
                  }
                  className={`btn btn-ghost btn-xs ${style.script === 'sub' ? 'text-primary' : ''}`}
                  title='Subscript'>
                  x₂
                </button>
                <button
                  type='button'
                  onClick={() =>
                    stylePatch({
                      script: style.script === 'sup' ? 'none' : 'sup',
                    })
                  }
                  className={`btn btn-ghost btn-xs ${style.script === 'sup' ? 'text-primary' : ''}`}
                  title='Superscript'>
                  x²
                </button>
              </div>
            </div>
            <ColorInput
              label='Color'
              value={style.color}
              onChange={(c) => stylePatch({ color: c })}
            />
            <ColorInput
              label='Highlight'
              value={style.highlight ?? ''}
              onChange={(c) => stylePatch({ highlight: c ? c : undefined })}
            />
            <div className='flex items-center gap-0.5'>
              {ALIGN_ICONS.map((a) => (
                <IconButton
                  key={a.value}
                  icon={a.icon}
                  label={`Align ${a.value}`}
                  size='sm'
                  active={style.align === a.value}
                  onClick={() => stylePatch({ align: a.value })}
                />
              ))}
              <div className='flex-1' />
              <SelectInput
                label='V'
                value={style.vertical}
                options={[
                  { value: 'top', label: 'Top' },
                  { value: 'middle', label: 'Middle' },
                  { value: 'bottom', label: 'Bottom' },
                ]}
                onChange={(v) => stylePatch({ vertical: v as TextStyle['vertical'] })}
              />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <Toggle
                label='Bullets'
                checked={style.bullet ?? false}
                onChange={(v) =>
                  stylePatch({
                    bullet: v,
                    numbered: v ? false : style.numbered,
                  })
                }
              />
              <Toggle
                label='Numbered'
                checked={style.numbered ?? false}
                onChange={(v) => stylePatch({ numbered: v, bullet: v ? false : style.bullet })}
              />
              <NumberInput
                label='Line H'
                value={style.lineHeight}
                min={0.8}
                max={3}
                step={0.1}
                onChange={(v) => stylePatch({ lineHeight: v })}
              />
              <NumberInput
                label='Spacing'
                value={style.letterSpacing}
                min={-2}
                max={10}
                onChange={(v) => stylePatch({ letterSpacing: v })}
              />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <NumberInput
                label='Cols'
                value={style.columns ?? 1}
                min={1}
                max={4}
                onChange={(v) => stylePatch({ columns: v > 1 ? v : undefined })}
              />
              <NumberInput
                label='Col gap'
                value={style.columnGap ?? 12}
                min={0}
                max={48}
                onChange={(v) => stylePatch({ columnGap: v })}
              />
            </div>
            <SelectInput
              label='Effect'
              value={style.transform ?? 'none'}
              options={TEXT_TRANSFORMS.map((t) => ({
                value: t.value,
                label: t.label,
              }))}
              onChange={(v) => stylePatch({ transform: v as TextStyle['transform'] })}
            />
          </div>
        </PanelSection>
      )}

      {(selected.kind === 'shape' || selected.kind === 'text') && (
        <PanelSection title='Fill'>
          <div className='flex flex-col gap-2'>
            <SelectInput
              label='Type'
              value={selected.fill?.type ?? 'none'}
              options={[
                { value: 'none', label: 'None' },
                { value: 'solid', label: 'Solid' },
                { value: 'gradient', label: 'Gradient' },
                { value: 'pattern', label: 'Pattern' },
                { value: 'image', label: 'Image' },
              ]}
              onChange={(v) => {
                if (v === 'solid')
                  patch({
                    fill: {
                      type: 'solid',
                      color: selected.fill?.type === 'solid' ? selected.fill.color : '#6366f1',
                      opacity: 1,
                    },
                  } as Partial<SlideObject>);
                else if (v === 'gradient')
                  patch({
                    fill: {
                      type: 'gradient',
                      from: '#6366f1',
                      to: '#22d3ee',
                      angle: 45,
                      opacity: 1,
                    },
                  } as Partial<SlideObject>);
                else if (v === 'pattern')
                  patch({
                    fill: {
                      type: 'pattern',
                      pattern: 'dots',
                      color: '#6366f1',
                    },
                  } as Partial<SlideObject>);
                else if (v === 'image')
                  patch({
                    fill: { type: 'image', src: '', opacity: 1 },
                  } as Partial<SlideObject>);
                else patch({ fill: { type: 'none' } } as Partial<SlideObject>);
              }}
            />
            {selected.fill?.type === 'solid' && (
              <ColorInput
                label='Color'
                value={selected.fill.color}
                onChange={(c) => patchFill({ color: c })}
              />
            )}
            {selected.fill?.type === 'gradient' && (
              <GradientStopsEditor
                fill={selected.fill}
                onChange={(stops) =>
                  patchFill({
                    stops,
                    from: stops[0]?.color,
                    to: stops[stops.length - 1]?.color,
                  })
                }
                onAngle={(angle) => patchFill({ angle })}
              />
            )}
            {selected.fill?.type === 'image' && (
              <input
                type='text'
                value={selected.fill.imageUrl}
                onChange={(e) => patchFill({ imageUrl: e.target.value })}
                className='input input-xs input-bordered w-full'
                placeholder='Image URL'
              />
            )}
            {selected.fill &&
              selected.fill.type !== 'none' &&
              selected.fill.type !== 'pattern' &&
              selected.fill.type !== 'image' && (
                <NumberInput
                  label='Opacity'
                  value={selected.fill.opacity}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => patchFill({ opacity: v })}
                />
              )}
            {selected.fill?.type === 'pattern' && (
              <SelectInput
                label='Pattern'
                value={selected.fill.pattern}
                options={[
                  { value: 'dots', label: 'Dots' },
                  { value: 'grid', label: 'Grid' },
                  { value: 'stripes', label: 'Stripes' },
                ]}
                onChange={(p) =>
                  patch({
                    fill: { ...selected.fill, pattern: p as 'dots' },
                  } as Partial<SlideObject>)
                }
              />
            )}
          </div>
        </PanelSection>
      )}

      {selected.kind === 'shape' && (
        <PanelSection title='Presets'>
          <div className='grid grid-cols-3 gap-1'>
            {SHAPE_PRESETS.map((p, i) => (
              <button
                key={p.label}
                type='button'
                onClick={() => applyPreset(i)}
                className='btn btn-outline btn-xs'>
                {p.label}
              </button>
            ))}
          </div>
        </PanelSection>
      )}

      {selected.kind === 'shape' && (
        <PanelSection title='Stroke & Shadow'>
          <div className='flex flex-col gap-2'>
            <ColorInput
              label='Stroke'
              value={selected.stroke.color === 'transparent' ? '#ffffff' : selected.stroke.color}
              onChange={(c) =>
                patch({
                  stroke: { ...selected.stroke, color: c },
                } as Partial<SlideObject>)
              }
            />
            <NumberInput
              label='Width'
              value={selected.stroke.width}
              min={0}
              max={40}
              onChange={(w) =>
                patch({
                  stroke: { ...selected.stroke, width: w },
                } as Partial<SlideObject>)
              }
            />
            <SelectInput
              label='Dash'
              value={selected.stroke.dash}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'dashed', label: 'Dashed' },
                { value: 'dotted', label: 'Dotted' },
              ]}
              onChange={(d) =>
                patch({
                  stroke: { ...selected.stroke, dash: d as 'solid' },
                } as Partial<SlideObject>)
              }
            />
            {selected.shapeType === 'line' && (
              <div className='flex items-center gap-2'>
                <Toggle
                  label='Arrow start'
                  checked={selected.stroke.arrowStart ?? false}
                  onChange={(v) =>
                    patch({
                      stroke: { ...selected.stroke, arrowStart: v },
                    } as Partial<SlideObject>)
                  }
                />
                <Toggle
                  label='Arrow end'
                  checked={selected.stroke.arrowEnd ?? false}
                  onChange={(v) =>
                    patch({
                      stroke: { ...selected.stroke, arrowEnd: v },
                    } as Partial<SlideObject>)
                  }
                />
              </div>
            )}
            <NumberInput
              label='Radius'
              value={selected.cornerRadius}
              min={0}
              max={200}
              onChange={(v) => patch({ cornerRadius: v } as Partial<SlideObject>)}
            />
            <div className='divider my-1' />
            <Toggle
              label='Shadow'
              checked={selected.shadow.enabled}
              onChange={(v) =>
                patch({
                  shadow: { ...selected.shadow, enabled: v },
                } as Partial<SlideObject>)
              }
            />
            {selected.shadow.enabled && (
              <>
                <ColorInput
                  label='Shadow'
                  value={selected.shadow.color}
                  onChange={(c) =>
                    patch({
                      shadow: { ...selected.shadow, color: c },
                    } as Partial<SlideObject>)
                  }
                />
                <NumberInput
                  label='Blur'
                  value={selected.shadow.blur}
                  min={0}
                  max={100}
                  onChange={(v) =>
                    patch({
                      shadow: { ...selected.shadow, blur: v },
                    } as Partial<SlideObject>)
                  }
                />
                <NumberInput
                  label='X'
                  value={selected.shadow.offsetX}
                  min={-50}
                  max={50}
                  onChange={(v) =>
                    patch({
                      shadow: { ...selected.shadow, offsetX: v },
                    } as Partial<SlideObject>)
                  }
                />
                <NumberInput
                  label='Y'
                  value={selected.shadow.offsetY}
                  min={-50}
                  max={50}
                  onChange={(v) =>
                    patch({
                      shadow: { ...selected.shadow, offsetY: v },
                    } as Partial<SlideObject>)
                  }
                />
              </>
            )}
          </div>
        </PanelSection>
      )}

      {selected.kind === 'shape' && (
        <PanelSection title='Effects'>
          <div className='flex flex-col gap-2'>
            <Toggle
              label='Reflection'
              checked={selected.effect?.reflection ?? false}
              onChange={(v) =>
                patch({
                  effect: { ...(selected.effect ?? {}), reflection: v },
                } as Partial<SlideObject>)
              }
            />
            <Toggle
              label='Bevel'
              checked={selected.effect?.bevel ?? false}
              onChange={(v) =>
                patch({
                  effect: { ...(selected.effect ?? {}), bevel: v },
                } as Partial<SlideObject>)
              }
            />
            <ColorInput
              label='Glow'
              value={selected.effect?.glowColor ?? ''}
              onChange={(c) =>
                patch({
                  effect: {
                    ...(selected.effect ?? {}),
                    glowColor: c ? c : undefined,
                    glowBlur: c ? (selected.effect?.glowBlur ?? 12) : undefined,
                  },
                } as Partial<SlideObject>)
              }
            />
            {selected.effect?.glowColor && (
              <NumberInput
                label='Glow blur'
                value={selected.effect.glowBlur ?? 12}
                min={0}
                max={100}
                onChange={(v) =>
                  patch({
                    effect: { ...(selected.effect ?? {}), glowBlur: v },
                  } as Partial<SlideObject>)
                }
              />
            )}
            <NumberInput
              label='Soft edges'
              value={selected.effect?.softEdges ?? 0}
              min={0}
              max={40}
              onChange={(v) =>
                patch({
                  effect: {
                    ...(selected.effect ?? {}),
                    softEdges: v || undefined,
                  },
                } as Partial<SlideObject>)
              }
            />
          </div>
        </PanelSection>
      )}

      {selected.kind === 'shape' && (
        <PanelSection title='Shape text'>
          <textarea
            value={selected.text ?? ''}
            onChange={(e) => patch({ text: e.target.value } as Partial<SlideObject>)}
            rows={3}
            className='textarea textarea-bordered textarea-xs w-full'
            placeholder='Text inside the shape'
          />
          {selected.text && selected.style && (
            <div
              className='border-base-300 mt-2 rounded border p-2 text-xs'
              style={textStyleCss(selected.style)}>
              {selected.text}
            </div>
          )}
        </PanelSection>
      )}

      {selected.kind === 'chart' && (
        <PanelSection title='Chart'>
          <div className='flex flex-col gap-2'>
            <SelectInput
              label='Type'
              value={selected.chartType}
              options={['column', 'bar', 'line', 'area', 'pie', 'doughnut', 'scatter'].map((t) => ({
                value: t,
                label: t,
              }))}
              onChange={(v) => patch({ chartType: v } as Partial<SlideObject>)}
            />
            <Toggle
              label='Legend'
              checked={selected.showLegend}
              onChange={(v) => patch({ showLegend: v } as Partial<SlideObject>)}
            />
            <Toggle
              label='Values'
              checked={selected.showValues}
              onChange={(v) => patch({ showValues: v } as Partial<SlideObject>)}
            />
            <div className='flex flex-col gap-1'>
              <span className='text-xs opacity-70'>Data</span>
              <textarea
                value={JSON.stringify(selected.data)}
                onChange={(e) => {
                  try {
                    patch({
                      data: JSON.parse(e.target.value),
                    } as Partial<SlideObject>);
                  } catch {
                    /* ignore invalid JSON */
                  }
                }}
                rows={3}
                className='textarea textarea-bordered textarea-xs font-mono'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs opacity-70'>Labels (comma separated)</span>
              <input
                type='text'
                value={selected.labels.join(', ')}
                onChange={(e) =>
                  patch({
                    labels: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  } as Partial<SlideObject>)
                }
                className='input input-xs input-bordered'
              />
            </div>
          </div>
        </PanelSection>
      )}

      {selected.kind === 'table' && (
        <PanelSection title='Table'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2'>
              <NumberInput
                label='Rows'
                value={selected.rows}
                min={1}
                max={30}
                onChange={(v) => patch({ rows: v } as Partial<SlideObject>)}
              />
              <NumberInput
                label='Cols'
                value={selected.cols}
                min={1}
                max={20}
                onChange={(v) => patch({ cols: v } as Partial<SlideObject>)}
              />
            </div>
            <Toggle
              label='Header row'
              checked={selected.headerRow}
              onChange={(v) => patch({ headerRow: v } as Partial<SlideObject>)}
            />
            <ColorInput
              label='Header'
              value={selected.headerFill}
              onChange={(c) => patch({ headerFill: c } as Partial<SlideObject>)}
            />
            <ColorInput
              label='Header text'
              value={selected.headerColor}
              onChange={(c) => patch({ headerColor: c } as Partial<SlideObject>)}
            />
            <div className='flex flex-col gap-1'>
              <span className='text-xs opacity-70'>Cells (JSON rows)</span>
              <textarea
                value={JSON.stringify(selected.data)}
                onChange={(e) => {
                  try {
                    patch({
                      data: JSON.parse(e.target.value),
                    } as Partial<SlideObject>);
                  } catch {
                    /* ignore */
                  }
                }}
                rows={4}
                className='textarea textarea-bordered textarea-xs font-mono'
              />
            </div>
          </div>
        </PanelSection>
      )}

      {selected.kind === 'diagram' && (
        <PanelSection title='Diagram'>
          <div className='flex flex-col gap-2'>
            <SelectInput
              label='Type'
              value={selected.diagramType}
              options={['process', 'cycle', 'hierarchy', 'matrix', 'pyramid'].map((t) => ({
                value: t,
                label: t,
              }))}
              onChange={(v) => patch({ diagramType: v } as Partial<SlideObject>)}
            />
            <ColorInput
              label='Color'
              value={selected.color}
              onChange={(c) => patch({ color: c } as Partial<SlideObject>)}
            />
            <TextArea
              label='Items (one per line)'
              value={selected.items.join('\n')}
              onChange={(v) => patch({ items: v.split('\n') } as Partial<SlideObject>)}
              rows={4}
            />
          </div>
        </PanelSection>
      )}

      {selected.kind === 'icon' && (
        <PanelSection title='Icon'>
          <ColorInput
            label='Color'
            value={selected.color}
            onChange={(c) => patch({ color: c } as Partial<SlideObject>)}
          />
        </PanelSection>
      )}

      {selected.kind === 'equation' && (
        <PanelSection title='Equation'>
          <input
            type='text'
            value={selected.latex}
            onChange={(e) => patch({ latex: e.target.value } as Partial<SlideObject>)}
            className='input input-xs input-bordered w-full'
          />
          <ColorInput
            label='Color'
            value={selected.color}
            onChange={(c) => patch({ color: c } as Partial<SlideObject>)}
          />
        </PanelSection>
      )}

      {selected.kind === 'image' && (
        <PanelSection title='Image'>
          <input
            type='text'
            value={selected.src}
            onChange={(e) => patch({ src: e.target.value } as Partial<SlideObject>)}
            className='input input-xs input-bordered w-full'
            placeholder='Image URL'
          />
          <NumberInput
            label='Corners'
            value={selected.corners}
            min={0}
            max={200}
            onChange={(v) => patch({ corners: v } as Partial<SlideObject>)}
          />
          <ColorInput
            label='Border'
            value={
              selected.border?.color === 'transparent'
                ? '#ffffff'
                : (selected.border?.color ?? '#ffffff')
            }
            onChange={(c) =>
              patch({
                border: {
                  ...(selected.border ?? {
                    color: 'transparent',
                    width: 0,
                    dash: 'solid',
                  }),
                  color: c,
                },
              } as Partial<SlideObject>)
            }
          />
        </PanelSection>
      )}

      {selected.kind === 'embed' && (
        <PanelSection title='Embed'>
          <SelectInput
            label='Type'
            value={selected.embedType}
            options={[
              { value: 'youtube', label: 'YouTube' },
              { value: 'mermaid', label: 'Mermaid' },
              { value: 'code', label: 'Code' },
            ]}
            onChange={(v) => patch({ embedType: v } as Partial<SlideObject>)}
          />
          {selected.embedType !== 'code' && (
            <input
              type='text'
              value={selected.url ?? ''}
              onChange={(e) => patch({ url: e.target.value } as Partial<SlideObject>)}
              className='input input-xs input-bordered w-full'
              placeholder='URL or mermaid source'
            />
          )}
          {selected.embedType === 'code' && (
            <>
              <SelectInput
                label='Language'
                value={selected.language ?? 'plain'}
                options={CODE_LANGUAGES.map((l) => ({ value: l, label: l }))}
                onChange={(v) => patch({ language: v } as Partial<SlideObject>)}
              />
              <textarea
                value={selected.code ?? ''}
                onChange={(e) => patch({ code: e.target.value } as Partial<SlideObject>)}
                rows={5}
                className='textarea textarea-bordered textarea-xs w-full font-mono'
                placeholder='Paste code'
              />
            </>
          )}
        </PanelSection>
      )}

      <PanelSection title='Link' defaultOpen={false}>
        <SelectInput
          label='Type'
          value={selected.link?.type ?? 'none'}
          options={[
            { value: 'none', label: 'None' },
            { value: 'url', label: 'URL' },
            { value: 'email', label: 'Email' },
            { value: 'slide', label: 'Slide' },
          ]}
          onChange={(v) => {
            if (v === 'none') {
              patch({ link: null } as unknown as Partial<SlideObject>);
            } else {
              patch({
                link: { type: v as Hyperlink['type'] },
              } as unknown as Partial<SlideObject>);
            }
          }}
        />
        {selected.link?.type === 'url' && (
          <input
            type='text'
            value={selected.link.url ?? ''}
            onChange={(e) => patchLink({ url: e.target.value })}
            className='input input-xs input-bordered w-full'
            placeholder='https://example.com'
          />
        )}
        {selected.link?.type === 'email' && (
          <input
            type='text'
            value={selected.link.email ?? ''}
            onChange={(e) => patchLink({ email: e.target.value })}
            className='input input-xs input-bordered w-full'
            placeholder='name@example.com'
          />
        )}
        {selected.link?.type === 'slide' && currentDeck && (
          <SelectInput
            label='Target slide'
            value={selected.link.slideId ?? ''}
            options={[
              { value: '', label: 'Choose…' },
              ...currentDeck.slides
                .filter((s) => !s.hidden)
                .map((s, i) => ({
                  value: s.id,
                  label: `${i + 1}. ${s.name || 'Slide'}`,
                })),
            ]}
            onChange={(v) => patchLink({ slideId: v })}
          />
        )}
        {selected.link?.type && (
          <div className='mt-2 flex items-center gap-1 text-[10px] opacity-50'>
            <FiLink className='size-3' />
            <span>Clicking this object advances to the target during presentation.</span>
          </div>
        )}
      </PanelSection>

      <PanelSection title='Position & Size'>
        <div className='grid grid-cols-2 gap-2'>
          <NumberInput
            label='X'
            value={Math.round(selected.x)}
            onChange={(v) => patch({ x: v } as Partial<SlideObject>)}
          />
          <NumberInput
            label='Y'
            value={Math.round(selected.y)}
            onChange={(v) => patch({ y: v } as Partial<SlideObject>)}
          />
          <NumberInput
            label='W'
            value={Math.round(selected.w)}
            onChange={(v) => patch({ w: v } as Partial<SlideObject>)}
          />
          <NumberInput
            label='H'
            value={Math.round(selected.h)}
            onChange={(v) => patch({ h: v } as Partial<SlideObject>)}
          />
        </div>
        <div className='mt-2 flex items-center gap-1'>
          <NumberInput
            label='Rotate'
            value={Math.round(selected.rotation)}
            min={0}
            max={360}
            onChange={(v) => patch({ rotation: v } as Partial<SlideObject>)}
          />
          <IconButton
            icon={FiRotateCcw}
            label='Rotate 90° CCW'
            size='sm'
            onClick={() =>
              patch({
                rotation: (Math.round(selected.rotation) - 90 + 360) % 360,
              } as Partial<SlideObject>)
            }
          />
          <IconButton
            icon={FiRotateCw}
            label='Rotate 90° CW'
            size='sm'
            onClick={() =>
              patch({
                rotation: (Math.round(selected.rotation) + 90) % 360,
              } as Partial<SlideObject>)
            }
          />
        </div>
        <div className='mt-2'>
          <NumberInput
            label='Opacity'
            value={selected.opacity}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => patch({ opacity: v } as Partial<SlideObject>)}
          />
        </div>
        <div className='mt-2 flex items-center gap-2'>
          <Toggle
            label='Lock'
            checked={selected.locked}
            onChange={(v) => patch({ locked: v } as Partial<SlideObject>)}
          />
          <Toggle
            label='Aspect'
            checked={selected.aspectLock ?? false}
            onChange={(v) => patch({ aspectLock: v } as Partial<SlideObject>)}
          />
          <div className='flex-1' />
          <IconButton
            icon={FiArrowLeft}
            label='Flip H'
            size='sm'
            onClick={() => patch({ flipH: !selected.flipH } as Partial<SlideObject>)}
          />
          <IconButton
            icon={FiArrowUp}
            label='Flip V'
            size='sm'
            onClick={() => patch({ flipV: !selected.flipV } as Partial<SlideObject>)}
          />
        </div>
      </PanelSection>

      <PanelSection title='Slide size' defaultOpen={false}>
        {currentDeck && (
          <>
            <div className='flex items-center gap-2'>
              <NumberInput
                label='Slide W'
                value={currentDeck.width}
                min={200}
                onChange={(v) => setDeckSize(v, currentDeck.height)}
              />
              <NumberInput
                label='Slide H'
                value={currentDeck.height}
                min={200}
                onChange={(v) => setDeckSize(currentDeck.width, v)}
              />
            </div>
            <div className='mt-2 flex gap-2'>
              <button
                type='button'
                onClick={() => setDeckSize(1800, 1013)}
                className='btn btn-outline btn-xs'>
                16:9
              </button>
              <button
                type='button'
                onClick={() => setDeckSize(1350, 1013)}
                className='btn btn-outline btn-xs'>
                4:3
              </button>
            </div>
            <div className='mt-2 flex items-center gap-2 text-xs'>
              <span className='opacity-70'>Orientation:</span>
              <button
                type='button'
                onClick={() => {
                  if (currentDeck.width >= currentDeck.height)
                    setDeckSize(currentDeck.height, currentDeck.width);
                }}
                className={`btn btn-outline btn-xs ${currentDeck.width < currentDeck.height ? 'btn-primary' : ''}`}>
                Portrait
              </button>
              <button
                type='button'
                onClick={() => {
                  if (currentDeck.width < currentDeck.height)
                    setDeckSize(currentDeck.height, currentDeck.width);
                }}
                className={`btn btn-outline btn-xs ${currentDeck.width >= currentDeck.height ? 'btn-primary' : ''}`}>
                Landscape
              </button>
            </div>
          </>
        )}
      </PanelSection>
    </div>
  );
};
