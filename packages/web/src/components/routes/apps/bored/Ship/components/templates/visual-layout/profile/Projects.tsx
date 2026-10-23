import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Project {
  name: string;
  description: string;
  tech: string[];
  highlights?: string[];
}

export const Projects: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Projects';
  const projects = (data.projects as Project[]) ?? [
    {
      name: 'Design System',
      description: 'A comprehensive component library used across 5 product teams.',
      tech: ['React', 'TypeScript', 'Storybook'],
      highlights: ['120+ components', '95% test coverage', 'Used by 40+ engineers'],
    },
    {
      name: 'Analytics Dashboard',
      description: 'Real-time analytics platform for tracking user behaviour.',
      tech: ['Next.js', 'D3.js', 'PostgreSQL'],
      highlights: ['Handles 1M+ events/day', 'Sub-second query response'],
    },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase'>{title}</h2>

      <ul className='flex flex-1 flex-col gap-2'>
        {projects.map((p, i) => (
          <li key={i} className='rounded-2xl border border-[#e5e7eb] p-2'>
            <span className='text-base-content text-xs font-bold'>
              <strong>{p.name}</strong>
            </span>
            <p className='text-neutral mt-1 text-xs leading-relaxed'>{p.description}</p>
            <div className='mt-1 flex flex-wrap gap-1'>
              {p.tech.map((t, j) => (
                <span
                  key={j}
                  className='bg-accent/10 text-accent rounded px-1.5 py-0.5 text-xs font-medium'>
                  {t}
                </span>
              ))}
            </div>
            {p.highlights && p.highlights.length > 0 && (
              <ul className='mt-1 flex flex-col gap-1'>
                {p.highlights.map((h, j) => (
                  <li key={j} className='flex items-center gap-1'>
                    <span className='bg-accent h-1 w-1 rounded-full' />
                    <span className='text-base-content text-xs'>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

Projects.displayName = 'Projects';
