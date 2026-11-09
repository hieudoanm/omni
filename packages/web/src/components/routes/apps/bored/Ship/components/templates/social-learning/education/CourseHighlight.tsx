import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const CourseHighlight: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const instructor = (data.instructor as string) ?? '';
  const modules = (data.modules as string[]) ?? [];
  const duration = (data.duration as string) ?? '';
  const level = (data.level as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content text-4xl leading-tight font-bold'>{title}</h1>
      {instructor && <p className='text-neutral mt-2 text-sm'>by {instructor}</p>}
      <div className='mt-4 flex gap-2'>
        {duration && (
          <span className='rounded-box bg-accent/10 text-accent px-4 py-2 text-sm font-bold'>
            {duration}
          </span>
        )}
        {level && (
          <span className='rounded-box bg-base-300 text-neutral px-4 py-2 text-sm font-bold'>
            {level}
          </span>
        )}
      </div>
      <ol className='mt-6 flex flex-col gap-2'>
        {modules.map((mod, i) => (
          <li key={i} className='flex items-center gap-4'>
            <span className='text-accent flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold'>
              {i + 1}
            </span>
            <p className='text-base-content text-sm'>{mod}</p>
          </li>
        ))}
      </ol>
      <Footer citation={citation} />
    </Background>
  );
};

CourseHighlight.displayName = 'CourseHighlight';
