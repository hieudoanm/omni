import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const TriWord: FC<TemplateProps> = ({ data }) => {
  const word1 = (data.word1 as string) ?? 'WORK';
  const word2 = (data.word2 as string) ?? 'hard';
  const word3 = (data.word3 as string) ?? 'PLAY';
  const text = (data.text as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex items-baseline gap-2 text-center'>
        <span className='text-primary text-4xl leading-none font-black'>{word1}</span>
        <span className='text-base-content text-base leading-none font-medium'>{word2}</span>
        <span className='text-primary text-4xl leading-none font-black'>{word3}</span>
      </div>
      {text && <p className='text-neutral mt-2 text-base leading-relaxed'>{text}</p>}
      <Footer citation={citation} />
    </Background>
  );
};

TriWord.displayName = 'TriWord';
