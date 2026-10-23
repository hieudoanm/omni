import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface OptionDef {
  label: string;
  desc: string;
}

export const Versus: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const optionA = (data.optionA as OptionDef) ?? {
    label: 'Option A',
    desc: '',
  };
  const optionB = (data.optionB as OptionDef) ?? {
    label: 'Option B',
    desc: '',
  };
  const features = (data.features as { a: string; b: string; label?: string }[]) ?? [];
  const rows =
    features.length > 0
      ? features
      : [
          { a: 'Free', b: 'Paid', label: 'Price' },
          { a: 'Basic', b: 'Advanced', label: 'Features' },
          { a: '1 user', b: 'Unlimited', label: 'Users' },
        ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='bg-accent/10 px-5 py-3'>
        <h1 className='text-base-content text-center text-4xl font-bold tracking-tight'>
          {title || 'Versus'}
        </h1>
      </div>
      <div className='flex items-center justify-center gap-2 px-5 py-2'>
        <span className='text-base-content text-sm font-bold'>{optionA.label}</span>
        <span className='text-primary text-sm font-bold'>VS</span>
        <span className='text-base-content text-sm font-bold'>{optionB.label}</span>
      </div>
      <ul className='flex flex-1 flex-col gap-2 px-8 pb-4'>
        {rows.map((row, i) => (
          <li key={i} className='rounded-box bg-accent/5 flex flex-col gap-1 px-4 py-2'>
            {row.label && (
              <span className='text-neutral text-[10px] font-medium tracking-wider uppercase'>
                {row.label}
              </span>
            )}
            <div className='flex items-start justify-between gap-4'>
              <span className='text-base-content flex-1 text-left text-base'>{row.a}</span>
              <span className='text-neutral text-xs'>|</span>
              <span className='text-base-content flex-1 text-right text-base'>{row.b}</span>
            </div>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

Versus.displayName = 'Versus';
