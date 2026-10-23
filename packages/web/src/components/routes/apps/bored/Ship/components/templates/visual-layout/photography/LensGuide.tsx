import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Lens {
  name: string;
  focalLength: string;
  aperture: string;
  use: string;
}

export const LensGuide: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Lens Guide';
  const lenses = (data.lenses as Lens[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent mb-1 text-xs font-bold tracking-[0.2em] uppercase'>Lens Guide</h2>
      <h1 className='text-base-content mb-2 text-4xl font-bold'>{title}</h1>
      {lenses.length > 0 && (
        <ul className='flex w-full max-w-md flex-col gap-1'>
          {lenses.map((lens, i) => (
            <li
              key={i}
              className='border-base-300 flex items-center gap-1 rounded border p-1 text-left'>
              <div className='bg-primary/10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full'>
                <span className='text-primary text-xs font-bold'>{lens.focalLength}</span>
              </div>
              <div className='flex-1'>
                <strong className='text-base-content text-xs font-bold'>{lens.name}</strong>
                <p className='text-neutral text-xs'>
                  {lens.aperture} · {lens.use}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

LensGuide.displayName = 'LensGuide';
