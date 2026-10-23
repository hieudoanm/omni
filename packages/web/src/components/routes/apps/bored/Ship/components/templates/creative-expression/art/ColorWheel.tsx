import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface ColorEntry {
  name: string;
  hex: string;
  role: string;
}

export const ColorWheel: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Color Theory';
  const subtitle = (data.subtitle as string) ?? '';
  const colors = (data.colors as ColorEntry[]) ?? [
    { name: 'Primary', hex: '#ef4444', role: 'Base' },
    { name: 'Secondary', hex: '#f97316', role: 'Mix' },
    { name: 'Tertiary', hex: '#eab308', role: 'Blend' },
    { name: 'Complement', hex: '#22c55e', role: 'Opposite' },
    { name: 'Neutral', hex: '#6b7280', role: 'Balance' },
  ];
  const tip = (data.tip as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <Header title={title} subtitle={subtitle} />
      <ul className='mb-3 flex w-full items-center justify-center gap-3'>
        {colors.map((c) => (
          <li key={c.name} className='flex flex-col items-center gap-1'>
            <div
              className='h-16 w-16 rounded-full shadow-md ring-2 ring-black/10'
              style={{ backgroundColor: c.hex }}
            />
            <h3 className='text-base-content text-xs font-bold'>{c.name}</h3>
            <span className='text-neutral text-xs tracking-wider uppercase'>{c.role}</span>
          </li>
        ))}
      </ul>
      {tip && (
        <div className='bg-primary/10 text-primary rounded-lg px-2 py-1 text-xs font-medium'>
          {tip}
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

ColorWheel.displayName = 'ColorWheel';
