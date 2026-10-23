import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const DailyWisdom: FC<TemplateProps> = ({ data }) => {
  const wisdom = (data.wisdom as string) ?? 'Simplicity is the ultimate sophistication.';
  const author = (data.author as string) ?? 'Leonardo da Vinci';
  const category = (data.category as string) ?? 'Philosophy';
  const date = (data.date as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <p className='badge badge-primary badge-outline mb-3 text-xs'>{category}</p>
      <p className='text-base-content mb-4 max-w-xl text-2xl leading-snug font-bold'>{wisdom}</p>
      <p className='text-secondary mb-1 text-xs font-medium'>— {author}</p>
      {date && <time className='text-base-content/50 text-xs'>{date}</time>}
      <Footer citation={citation} />
    </Background>
  );
};
DailyWisdom.displayName = 'DailyWisdom';
