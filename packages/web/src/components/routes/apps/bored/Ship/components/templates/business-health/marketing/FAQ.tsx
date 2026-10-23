import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface QAItem {
  q: string;
  a: string;
}

export const FAQ: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const items = (data.items as QAItem[]) ?? [];
  const pairs =
    items.length > 0
      ? items
      : [
          {
            q: 'How does it work?',
            a: 'Sign up and start using it immediately with no setup required.',
          },
          {
            q: 'Is it free?',
            a: 'Yes, our basic plan is free with optional premium features.',
          },
        ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-8 text-center text-4xl font-bold tracking-tight'>
        {title}
      </h1>
      <div className='flex flex-col gap-4'>
        {pairs.map((qa, i) => (
          <div key={i} className='rounded-box border-accent/20 bg-accent/5 border p-5'>
            <p className='text-base-content mb-2 text-sm font-bold'>{qa.q}</p>
            <p className='text-neutral text-sm leading-relaxed'>{qa.a}</p>
          </div>
        ))}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

FAQ.displayName = 'FAQ';
