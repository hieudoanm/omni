import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const TipCard: FC<TemplateProps> = ({ data }) => {
  const number = (data.number as string) ?? '01';
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex flex-col gap-4'>
        <span className='text-primary/20 text-4xl font-black tracking-tighter'>{number}</span>
        <Header title={title} subtitle={text} />
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

TipCard.displayName = 'TipCard';
