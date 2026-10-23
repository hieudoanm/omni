import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface PaletteColor {
  name: string;
  hex: string;
}

export const ColorPalette: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Brand Palette';
  const colors = (data.colors as PaletteColor[]) ?? [
    { name: 'Primary', hex: '#6366f1' },
    { name: 'Secondary', hex: '#8b5cf6' },
    { name: 'Accent', hex: '#f59e0b' },
    { name: 'Neutral', hex: '#64748b' },
    { name: 'Background', hex: '#f8fafc' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-3 text-4xl font-black'>{title}</h1>
      <ul className='flex flex-1 flex-col gap-2'>
        {colors.map((color) => (
          <li key={color.name} className='flex items-center gap-2'>
            <div
              className='h-8 w-8 shrink-0 rounded-lg shadow-sm ring-1 ring-black/5'
              style={{ backgroundColor: color.hex }}
            />
            <div className='flex flex-col'>
              <span className='text-base-content text-xs font-bold'>{color.name}</span>
              <span className='text-neutral text-xs tracking-wide uppercase'>{color.hex}</span>
            </div>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

ColorPalette.displayName = 'ColorPalette';
