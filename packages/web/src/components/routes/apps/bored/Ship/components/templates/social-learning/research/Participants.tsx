import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Demographic {
  label: string;
  value: string;
}

export const Participants: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Participants';
  const sampleSize = (data.sampleSize as string) ?? 'N = 240';
  const demographics = (data.demographics as Demographic[]) ?? [
    { label: 'Age', value: 'M = 28.4, SD = 6.2' },
    { label: 'Gender', value: '52% Female, 48% Male' },
    { label: 'Education', value: "78% Bachelor's or higher" },
  ];
  const method = (data.method as string) ?? 'Recruited via Prolific Academic';
  const criteria = (data.criteria as string[]) ?? [
    'Aged 18–65',
    'Native English speakers',
    'No prior exposure to study stimuli',
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent mb-3 text-sm font-bold tracking-[0.2em] uppercase'>
        Participants
      </span>
      <h1 className='text-base-content text-4xl leading-tight font-bold'>{title}</h1>

      <div className='mt-6 flex items-center gap-4'>
        <span className='text-accent text-3xl font-black'>{sampleSize}</span>
        <span className='text-neutral text-sm'>total participants</span>
      </div>

      <ul className='mt-6 flex flex-col gap-2'>
        {demographics.map((d, i) => (
          <li key={i} className='flex items-center justify-between border-b border-[#e5e7eb] pb-2'>
            <span className='text-neutral text-sm font-medium'>{d.label}</span>
            <span className='text-base-content text-sm font-semibold'>{d.value}</span>
          </li>
        ))}
      </ul>

      <div className='bg-base-200 mt-6 rounded-2xl p-3'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Recruitment
        </span>
        <p className='text-base-content mt-2 text-sm'>{method}</p>
      </div>

      <div className='mt-4'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Inclusion Criteria
        </span>
        <ul className='mt-2 flex flex-col gap-2'>
          {criteria.map((c, i) => (
            <li key={i} className='flex items-center gap-2'>
              <span className='bg-accent h-2 w-2 flex-shrink-0 rounded-full' />
              <span className='text-base-content text-sm'>{c}</span>
            </li>
          ))}
        </ul>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Participants.displayName = 'Participants';
