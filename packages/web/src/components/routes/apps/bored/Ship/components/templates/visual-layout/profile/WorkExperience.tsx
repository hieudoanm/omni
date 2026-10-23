import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Job {
  company: string;
  role: string;
  period: string;
  achievements: string[];
}

export const WorkExperience: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Work Experience';
  const jobs = (data.jobs as Job[]) ?? [
    {
      company: 'Figma',
      role: 'Senior Product Designer',
      period: '2022 — Present',
      achievements: [
        'Led design system used by 50+ engineers',
        'Shipped 3 major features reaching 2M users',
      ],
    },
    {
      company: 'Stripe',
      role: 'Product Designer',
      period: '2019 — 2022',
      achievements: [
        'Redesigned checkout flow increasing conversion 18%',
        'Built and mentored design guild of 8 designers',
      ],
    },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase'>{title}</h2>

      <ul className='flex flex-1 flex-col gap-1'>
        {jobs.map((job, i) => (
          <li key={i}>
            <div className='flex items-baseline justify-between'>
              <span className='text-base-content text-xs font-bold'>
                <strong>{job.role}</strong>
              </span>
              <time className='text-neutral text-xs'>{job.period}</time>
            </div>
            <span className='text-accent text-xs font-semibold'>{job.company}</span>
            <ul className='mt-1 flex flex-col gap-1'>
              {job.achievements.map((a, j) => (
                <li key={j} className='flex items-start gap-1'>
                  <span className='bg-accent mt-1 h-1 w-1 flex-shrink-0 rounded-full' />
                  <span className='text-base-content text-xs leading-relaxed'>{a}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

WorkExperience.displayName = 'WorkExperience';
