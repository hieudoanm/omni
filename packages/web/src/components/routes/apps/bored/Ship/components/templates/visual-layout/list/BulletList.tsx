import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const BulletList: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const items = (data.items as string[]) ?? [];
  const list = items.length > 0 ? items : ['Point one', 'Point two', 'Point three'];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex flex-col gap-y-4'>
        <Header title={title} />
        <ul className='flex flex-1 flex-col gap-2 text-left'>
          {list.map((item) => (
            <li key={item} className='flex items-start gap-3'>
              <span className='bg-primary mt-1.5 flex h-2 w-2 flex-shrink-0 rounded-full' />
              <span className='text-base-content text-sm leading-relaxed'>{item}</span>
            </li>
          ))}
        </ul>
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

BulletList.displayName = 'BulletList';
