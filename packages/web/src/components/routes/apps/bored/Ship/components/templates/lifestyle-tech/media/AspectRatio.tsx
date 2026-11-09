import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const AspectRatio: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Common Ratios';
  const ratios = (data.ratios as { label: string; description: string }[]) ?? [
    { label: '1:1', description: 'Instagram Feed' },
    { label: '4:5', description: 'Instagram Portrait' },
    { label: '16:9', description: 'YouTube Thumbnail' },
  ];

  const getDimensions = (label: string) => {
    const [w, h] = label.split(':').map(Number);
    const scale = 80 / Math.max(w, h);
    return { width: w * scale, height: h * scale };
  };

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-6 text-4xl font-bold'>{title}</h1>
      <ul className='flex flex-1 flex-col items-center justify-center gap-6'>
        {ratios.map((r, i) => {
          const dim = getDimensions(r.label);
          return (
            <li key={i} className='flex flex-col items-center gap-2'>
              <div className='bg-accent/10 border-accent/30 flex items-center justify-center rounded border'>
                <strong className='text-accent text-xs font-bold'>{r.label}</strong>
                <Footer citation={citation} />
              </div>
              <p className='text-neutral text-xs'>{r.description}</p>
            </li>
          );
        })}
      </ul>
    </Background>
  );
};

AspectRatio.displayName = 'AspectRatio';
