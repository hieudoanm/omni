import type { FC } from 'react';

export const RawTab: FC<{
  content: string;
}> = ({ content }) => (
  <pre className='text-base-content max-h-[70vh] overflow-y-auto p-6 text-xs leading-relaxed whitespace-pre-wrap'>
    {content}
  </pre>
);
