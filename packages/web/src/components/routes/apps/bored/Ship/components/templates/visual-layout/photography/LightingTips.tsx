import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface LightingTip {
  label: string;
  desc: string;
}

export const LightingTips: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Lighting Tips';
  const setup = (data.setup as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const tips = (data.tips as LightingTip[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent mb-1 text-xs font-bold tracking-[0.2em] uppercase'>Lighting</h2>
      <Header title={title} subtitle={subtitle} />
      {tips.length > 0 && (
        <ul className='mt-1 grid w-full max-w-md grid-cols-2 gap-1'>
          {tips.map((tip, i) => (
            <li key={i} className='border-base-300 rounded border p-1 text-left'>
              <strong className='text-primary text-xs font-bold'>{tip.label}</strong>
              <p className='text-neutral mt-1 text-xs leading-relaxed'>{tip.desc}</p>
            </li>
          ))}
        </ul>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

LightingTips.displayName = 'LightingTips';
