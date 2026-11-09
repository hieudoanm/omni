import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface StatItem {
  value: string;
  label: string;
}

export const StatRow: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const text = (data.text as string) ?? '';
  const stats = (data.stats as StatItem[]) ?? [];
  const items =
    stats.length > 0
      ? stats
      : [
          { value: '10K+', label: 'Users' },
          { value: '99%', label: 'Uptime' },
          { value: '24/7', label: 'Support' },
        ];
  const citation = (data.citation as string) ?? '';

  return (
    <Background>
      <div className='flex flex-col gap-y-4'>
        <Header title={title} subtitle={text || undefined} />
        <ul className='flex flex-1 items-start justify-center gap-2'>
          {items.slice(0, 3).map((s, i) => (
            <li
              key={i}
              className='rounded-box bg-accent/5 flex flex-1 flex-col items-center p-4 text-center'>
              <span className='text-primary text-4xl font-black tracking-tight'>{s.value}</span>
              <span className='text-neutral mt-1 text-xs font-semibold tracking-widest uppercase'>
                {s.label}
              </span>
            </li>
          ))}
        </ul>

        <Footer citation={citation} />
      </div>
    </Background>
  );
};

StatRow.displayName = 'StatRow';
