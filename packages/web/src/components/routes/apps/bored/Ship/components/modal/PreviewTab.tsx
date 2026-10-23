import type { FC } from 'react';

export const PreviewTab: FC<{
  html: string;
}> = ({ html }) => (
  <div
    className='markdown-body max-h-[70vh] overflow-y-auto !bg-transparent p-6'
    dangerouslySetInnerHTML={{ __html: html }}
  />
);
