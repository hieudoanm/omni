import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const Listicle: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const items = (data.items as string[]) ?? [];
  const text = (data.text as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';
  const list =
    items.length > 0
      ? items
      : ['First key point', 'Second important point', 'Third compelling takeaway'];

  const count = list.length;
  const gap = (() => {
    if (count <= 2) return 'gap-1';
    if (count <= 4) return 'gap-1';
    if (count <= 6) return 'gap-1';
    if (count <= 8) return 'gap-0.5';
    if (count <= 10) return 'gap-0.5';
    return 'gap-px';
  })();

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div>
        <Header title={title} subtitle={text} />
        <ol className={`flex flex-1 flex-col ${gap}`}>
          {list.map((item, i) => (
            <li key={i} className='rounded-box bg-accent/5 flex items-center gap-2 px-1 py-1'>
              <span className='bg-primary text-primary-content flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold'>
                {i + 1}
              </span>
              <span className='text-base-content text-xs leading-tight font-medium'>{item}</span>
            </li>
          ))}
        </ol>
        {imageUrl && (
          <img
            src={imageUrl}
            alt=''
            className='rounded-box mt-2 h-8 w-full flex-shrink-0 object-cover'
          />
        )}
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

Listicle.displayName = 'Listicle';
