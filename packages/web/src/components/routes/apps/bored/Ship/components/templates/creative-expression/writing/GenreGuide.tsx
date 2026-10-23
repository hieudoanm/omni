import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const GenreGuide: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Genre Guide';
  const genre = (data.genre as string) ?? 'Mystery';
  const subtitle = (data.subtitle as string) ?? '';
  const elements = (data.elements as string[]) ?? ['Clues', 'Red herrings', 'Revelation'];
  const examples = (data.examples as string[]) ?? ['Sherlock Holmes', 'Gone Girl'];
  const tip = (data.tip as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <Header title={title} subtitle={subtitle} />
      <div className='mb-2 w-full max-w-sm text-left'>
        <h2 className='text-base-content mb-1 block text-xs font-bold tracking-wider uppercase'>
          Required Elements
        </h2>
        <ul className='space-y-1'>
          {elements.map((el) => (
            <li key={el} className='text-neutral flex items-start gap-1 text-xs'>
              <span className='text-primary mt-0.5'>&#9679;</span>
              {el}
            </li>
          ))}
        </ul>
      </div>
      {examples.length > 0 && (
        <ul className='mb-2 flex flex-wrap justify-center gap-1'>
          {examples.map((ex) => (
            <li key={ex} className='badge badge-outline badge-sm'>
              {ex}
            </li>
          ))}
        </ul>
      )}
      {tip && (
        <div className='bg-accent/10 text-accent max-w-sm rounded-lg px-2 py-1 text-xs font-medium'>
          {tip}
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

GenreGuide.displayName = 'GenreGuide';
