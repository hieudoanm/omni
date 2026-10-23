import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const ResumeTip: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Resume Tip';
  const tip = (data.tip as string) ?? '';
  const category = (data.category as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const examples = (data.examples as string[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <Header title={title} subtitle={subtitle} />
      {examples.length > 0 && (
        <ul className='text-base-content/70 space-y-1 text-left text-xs'>
          {examples.map((example, index) => (
            <li key={index} className='flex items-start gap-1'>
              <span className='text-secondary mt-0.5'>▸</span>
              <span>{example}</span>
            </li>
          ))}
        </ul>
      )}
      <Footer citation={citation} />
    </Background>
  );
};
ResumeTip.displayName = 'ResumeTip';
