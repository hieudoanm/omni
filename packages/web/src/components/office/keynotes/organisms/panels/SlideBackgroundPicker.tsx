'use client';

import { type FC, useRef } from 'react';
import type { FillStyle, SlideBackground } from '@/types/keynotes/deck';
import { ColorInput, NumberInput } from '@/components/office/keynotes/atoms/FormControls';

const TYPES = [
  { value: 'solid', label: 'Solid' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image' },
] as const;

export const SlideBackgroundPicker: FC<{
  value: SlideBackground;
  onChange: (fill: FillStyle) => void;
}> = ({ value, onChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const type = value.type === 'none' ? 'solid' : value.type;

  const upload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange({ type: 'image', imageUrl: String(reader.result), opacity: 1 });
    reader.readAsDataURL(file);
  };

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-1'>
        {TYPES.map((t) => (
          <button
            key={t.value}
            type='button'
            onClick={() =>
              onChange(
                t.value === 'solid'
                  ? { type: 'solid', color: '#0b1020', opacity: 1 }
                  : t.value === 'gradient'
                    ? {
                        type: 'gradient',
                        from: '#0b1020',
                        to: '#131a33',
                        angle: 135,
                        opacity: 1,
                      }
                    : { type: 'image', imageUrl: '', opacity: 1 },
              )
            }
            className={`btn btn-xs flex-1 ${type === t.value ? 'btn-primary' : 'btn-outline'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {type === 'solid' && (
        <ColorInput
          label='Color'
          value={value.type === 'solid' ? value.color : '#0b1020'}
          onChange={(color) => onChange({ type: 'solid', color, opacity: 1 })}
        />
      )}

      {type === 'gradient' && value.type === 'gradient' && (
        <>
          <div className='flex items-center gap-2'>
            <ColorInput
              label='From'
              value={value.from}
              onChange={(from) => onChange({ ...value, from })}
            />
          </div>
          <div className='flex items-center gap-2'>
            <ColorInput label='To' value={value.to} onChange={(to) => onChange({ ...value, to })} />
          </div>
          <NumberInput
            label='Angle'
            value={value.angle}
            onChange={(angle) => onChange({ ...value, angle })}
            min={0}
            max={360}
          />
          <div
            className='border-base-300 h-6 rounded border'
            style={{
              background: `linear-gradient(${value.angle}deg, ${value.from}, ${value.to})`,
            }}
          />
        </>
      )}

      {type === 'image' && (
        <>
          <input
            type='text'
            value={value.type === 'image' ? value.imageUrl : ''}
            onChange={(e) => onChange({ type: 'image', imageUrl: e.target.value, opacity: 1 })}
            className='input input-xs input-bordered'
            placeholder='Image URL'
          />
          <button
            type='button'
            onClick={() => fileRef.current?.click()}
            className='btn btn-outline btn-xs'>
            Upload image…
          </button>
          <input
            ref={fileRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
          />
        </>
      )}
    </div>
  );
};

export const normalizeBackground = (
  bg: SlideBackground | undefined,
  fallback: string,
): SlideBackground =>
  bg && bg.type !== 'none' ? bg : { type: 'solid', color: fallback, opacity: 1 };
