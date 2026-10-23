import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const NetworkingTip: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Networking Tip';
  const tip = (data.tip as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const doList = (data.doList as string[]) ?? [];
  const dontList = (data.dontList as string[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <Header title={title} subtitle={subtitle} />
      <div className='flex w-full max-w-lg gap-3'>
        <div className='bg-success/10 flex-1 rounded-lg p-2 text-left'>
          <p className='text-success mb-1 text-xs font-bold'>✓ Do</p>
          <ul className='space-y-0.5'>
            {doList.map((item, index) => (
              <li key={index} className='text-base-content/70 text-xs'>
                • {item}
              </li>
            ))}
          </ul>
        </div>
        <div className='bg-error/10 flex-1 rounded-lg p-2 text-left'>
          <p className='text-error mb-1 text-xs font-bold'>✗ Don't</p>
          <ul className='space-y-0.5'>
            {dontList.map((item, index) => (
              <li key={index} className='text-base-content/70 text-xs'>
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};
NetworkingTip.displayName = 'NetworkingTip';
