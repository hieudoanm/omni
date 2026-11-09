import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface SkillLevel {
  level: string;
  description: string;
  duration: string;
}

export const SkillRoadmap: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Skill Roadmap';
  const skill = (data.skill as string) ?? '';
  const levels = (data.levels as SkillLevel[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-primary mb-0.5 text-4xl font-bold'>{title}</h1>
      {skill && <p className='badge badge-primary mb-3'>{skill}</p>}
      <ul className='flex w-full max-w-md flex-col items-center gap-1'>
        {levels.map((item, index) => (
          <li key={index} className='bg-base-200 flex w-full items-center gap-1 rounded-lg p-2'>
            <div className='bg-primary text-primary-content flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold'>
              {index + 1}
            </div>
            <div className='flex-1 text-left'>
              <div className='flex items-center gap-1'>
                <p className='text-primary text-xs font-semibold'>{item.level}</p>
                <span className='text-base-content/40 text-xs'>· {item.duration}</span>
              </div>
              <p className='text-base-content/70 text-xs'>{item.description}</p>
            </div>
            {index < levels.length - 1 && (
              <div className='text-secondary absolute -mb-4 ml-2.5 text-xs'>↓</div>
            )}
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};
SkillRoadmap.displayName = 'SkillRoadmap';
