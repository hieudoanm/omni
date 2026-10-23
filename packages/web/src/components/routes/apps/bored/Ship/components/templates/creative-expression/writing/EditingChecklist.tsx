import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface ChecklistCategory {
  name: string;
  items: string[];
}

export const EditingChecklist: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Editing Checklist';
  const subtitle = (data.subtitle as string) ?? '';
  const categories = (data.categories as ChecklistCategory[]) ?? [
    {
      name: 'Structure',
      items: ['Clear thesis', 'Logical flow', 'Strong conclusion'],
    },
    {
      name: 'Language',
      items: ['Grammar correct', 'Varied sentence length', 'Active voice'],
    },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <Header title={title} subtitle={subtitle} />
      <ul className='w-full max-w-md space-y-1 text-left'>
        {categories.map((cat) => (
          <li key={cat.name}>
            <h2 className='text-base-content mb-1 block text-xs font-bold tracking-wider uppercase'>
              {cat.name}
            </h2>
            <ul className='space-y-1'>
              {cat.items.map((item) => (
                <li key={item} className='flex items-center gap-1 text-xs'>
                  <span className='text-success font-bold'>&#10003;</span>
                  <span className='text-neutral'>{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

EditingChecklist.displayName = 'EditingChecklist';
