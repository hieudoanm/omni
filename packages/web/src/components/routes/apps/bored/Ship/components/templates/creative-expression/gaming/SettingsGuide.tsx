import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface Setting {
  name: string;
  value: string;
  recommendation: string;
}

export const SettingsGuide: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Optimal Settings';
  const game = (data.game as string) ?? 'Game Title';
  const subtitle = (data.subtitle as string) ?? 'Best settings for competitive play';
  const settings =
    (data.settings as Setting[]) ??
    ([{ name: 'Graphics', value: 'Ultra', recommendation: 'Medium' }] as Setting[]);

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <Header title={title} subtitle={subtitle} />
      <ul className='flex flex-1 flex-col gap-1'>
        <li className='text-base-300 flex text-xs font-bold tracking-wider uppercase'>
          <span className='w-2/5'>Setting</span>
          <span className='w-1/5 text-center'>Default</span>
          <span className='w-2/5 text-right'>Recommended</span>
        </li>
        {settings.map((item, i) => (
          <li key={i} className='bg-base-200 flex items-center rounded-lg px-2 py-1.5'>
            <span className='text-base-content w-2/5 text-xs font-semibold'>{item.name}</span>
            <span className='text-neutral w-1/5 text-center text-xs'>{item.value}</span>
            <span className='text-success w-2/5 text-right text-xs font-bold'>
              {item.recommendation}
            </span>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

SettingsGuide.displayName = 'SettingsGuide';
