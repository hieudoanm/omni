import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const Mosaic: FC<TemplateProps> = ({ data }) => {
  const images = (data.images as string[]) ?? [];
  const urls = images.length >= 4 ? images.slice(0, 4) : ['', '', '', ''];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <ul className='grid h-full w-full grid-cols-2 grid-rows-2 gap-1 p-1'>
        {urls.map((url, i) =>
          url ? (
            <li key={i}>
              <img src={url} alt='' className='rounded-box h-full w-full object-cover' />
            </li>
          ) : (
            <li
              key={i}
              className='rounded-box border-accent/30 bg-accent/5 text-accent flex h-full w-full items-center justify-center border-2 border-dashed text-xs'>
              Image {i + 1} (1:1)
            </li>
          ),
        )}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

Mosaic.displayName = 'Mosaic';
