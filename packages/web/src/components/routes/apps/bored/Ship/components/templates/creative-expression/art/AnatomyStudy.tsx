import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Note {
  area: string;
  description: string;
}

export const AnatomyStudy: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Anatomy Study';
  const subject = (data.subject as string) ?? '';
  const notes = (data.notes as Note[]) ?? [
    { area: 'Skeletal', description: 'Bone structure and joints' },
    { area: 'Muscular', description: 'Muscle groups and tension' },
    { area: 'Proportions', description: 'Head-to-body ratios' },
  ];
  const tip = (data.tip as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-0.5 text-4xl font-black tracking-tight'>{title}</h1>
      {subject && <p className='text-primary mb-3 text-xs font-semibold'>{subject}</p>}
      <ul className='mb-3 grid w-full grid-cols-2 gap-2'>
        {notes.map((n) => (
          <li key={n.area} className='bg-base-200 rounded-lg p-2 text-left'>
            <h3 className='text-primary text-xs font-bold tracking-wider uppercase'>{n.area}</h3>
            <p className='text-neutral mt-0.5 text-xs leading-relaxed'>{n.description}</p>
          </li>
        ))}
      </ul>
      {tip && (
        <div className='bg-accent/10 text-accent rounded-lg px-2 py-1 text-xs font-medium'>
          {tip}
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

AnatomyStudy.displayName = 'AnatomyStudy';
