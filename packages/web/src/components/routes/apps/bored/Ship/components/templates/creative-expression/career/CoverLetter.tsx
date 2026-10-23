import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const CoverLetter: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Cover Letter';
  const greeting = (data.greeting as string) ?? '';
  const body = (data.body as string) ?? '';
  const closing = (data.closing as string) ?? '';
  const signature = (data.signature as string) ?? '';

  const paragraphs = body.split('\n').filter((p) => p.trim());

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-primary mb-3 text-4xl font-bold'>{title}</h1>
      <div className='text-base-content/80 max-w-lg space-y-2 text-left text-xs leading-relaxed'>
        {greeting && <p className='font-medium'>{greeting}</p>}
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        {closing && <p className='mt-1'>{closing}</p>}
        {signature && <p className='text-primary mt-1 font-semibold italic'>{signature}</p>}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};
CoverLetter.displayName = 'CoverLetter';
