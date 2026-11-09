import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface ArtStyle {
  name: string;
  era: string;
  description: string;
  characteristics: string;
}

export const StyleGuide: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Art Styles';
  const styles = (data.styles as ArtStyle[]) ?? [
    {
      name: 'Impressionism',
      era: '1860s',
      description: 'Light and movement',
      characteristics: 'Visible brushstrokes, open composition',
    },
    {
      name: 'Cubism',
      era: '1907',
      description: 'Geometric forms',
      characteristics: 'Fragmented objects, multiple viewpoints',
    },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-3 text-4xl font-black tracking-tight'>{title}</h1>
      <ul className='flex w-full flex-col gap-3'>
        {styles.map((s) => (
          <li key={s.name} className='bg-base-200 rounded-lg p-2 text-left'>
            <div className='mb-1 flex items-center gap-1'>
              <h3 className='text-base-content text-xs font-bold'>{s.name}</h3>
              <span className='bg-primary/15 text-primary rounded-full px-1 py-0.5 text-xs font-semibold tracking-wider uppercase'>
                {s.era}
              </span>
            </div>
            <p className='text-neutral mb-1 text-xs leading-relaxed'>{s.description}</p>
            <p className='text-base-content/60 text-xs italic'>{s.characteristics}</p>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

StyleGuide.displayName = 'StyleGuide';
