import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Feature {
  title: string;
  description: string;
}

export const ValueProp: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Why Choose Us';
  const features = (data.features as Feature[]) ?? [
    {
      title: 'Lightning Fast',
      description: 'Optimized for speed at every layer',
    },
    {
      title: 'Built to Scale',
      description: 'Grows with your business effortlessly',
    },
    {
      title: 'Secure by Default',
      description: 'Enterprise-grade security out of the box',
    },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-3 text-center'>
        <h2 className='text-base-content text-sm font-bold'>{title}</h2>
      </div>
      <ul className='flex flex-1 flex-col gap-2'>
        {features.map((f, i) => (
          <li key={i} className='border-base-300 flex items-start gap-3 rounded border px-3 py-2'>
            <div className='bg-primary flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold text-white'>
              {i + 1}
            </div>
            <div>
              <h3 className='text-base-content text-xs font-bold'>{f.title}</h3>
              <p className='text-neutral mt-0.5 text-xs'>{f.description}</p>
            </div>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

ValueProp.displayName = 'ValueProp';
