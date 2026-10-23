import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface StoryElement {
  name: string;
  description: string;
}

export const StoryStructure: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Story Structure';
  const structure = (data.structure as string) ?? 'Three-Act Structure';
  const subtitle = (data.subtitle as string) ?? '';
  const elements = (data.elements as StoryElement[]) ?? [
    { name: 'Setup', description: 'Introduce characters and world' },
    { name: 'Confrontation', description: 'Rising conflict and stakes' },
    { name: 'Resolution', description: 'Climax and resolution' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <Header title={title} subtitle={subtitle} />
      <ol className='w-full max-w-sm space-y-2 text-left'>
        {elements.map((el, i) => (
          <li key={el.name} className='flex items-start gap-2'>
            <span className='badge badge-primary badge-sm mt-0.5 shrink-0'>{i + 1}</span>
            <div>
              <h3 className='text-base-content text-xs font-bold'>{el.name}</h3>
              <p className='text-neutral text-xs leading-relaxed'>{el.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <Footer citation={citation} />
    </Background>
  );
};

StoryStructure.displayName = 'StoryStructure';
