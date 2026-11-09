import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const MindMap: FC<TemplateProps> = ({ data }) => {
  const central = (data.central as string) ?? 'Web Dev';
  const branches = (data.branches as { topic: string; detail: string }[]) ?? [
    { topic: 'Frontend', detail: 'React, Vue, Angular' },
    { topic: 'Backend', detail: 'Node, Python, Go' },
    { topic: 'DevOps', detail: 'Docker, K8s, CI/CD' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='bg-primary text-primary-content mb-4 rounded-full px-8 py-4 text-2xl font-black'>
        {central}
      </div>
      <ul className='flex w-full flex-col gap-3'>
        {branches.map((b, i) => (
          <li key={i} className='flex items-center gap-4'>
            <div className='bg-accent/20 h-px w-8' />
            <div className='bg-base-200 flex-1 rounded-2xl px-4 py-3'>
              <p className='text-base-content text-sm font-bold'>{b.topic}</p>
              <p className='text-neutral text-sm'>{b.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

MindMap.displayName = 'MindMap';
