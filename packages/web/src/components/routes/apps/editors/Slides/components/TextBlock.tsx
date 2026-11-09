import { FC } from 'react';

export const TextBlock: FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
  <div className={className}>
    <pre className='m-0 inline pb-8 break-words whitespace-pre-wrap'>{text}</pre>
  </div>
);
TextBlock.displayName = 'TextBlock';
