import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const IconText: FC<TemplateProps> = ({ data }) => {
  const icon = (data.icon as string) ?? '🚀';
  const title = (data.title as string) ?? 'Ship Faster';
  const text = (data.text as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='text-center'>
        <div className='text-primary text-4xl leading-none'>{icon}</div>
        <h1 className='text-base-content mt-2 text-4xl font-bold tracking-tight'>{title}</h1>
        {text && <p className='text-neutral mt-2 text-base leading-relaxed'>{text}</p>}
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

IconText.displayName = 'IconText';
