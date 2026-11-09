import { FC } from 'react';

import { TextBlock } from './TextBlock';
import { SlideBlock } from '../types';

export const CenterBlock: FC<{ block: SlideBlock }> = ({ block }) => {
  switch (block.type) {
    case 'title':
      return (
        <TextBlock text={block.text} className='text-base-content mb-8 text-5xl font-normal' />
      );
    case 'subtitle':
      return <TextBlock text={block.text} className='text-primary mb-8 text-3xl font-normal' />;
    case 'text':
      return <TextBlock text={block.text} className='text-neutral-content mb-8 text-xl' />;
    case 'pricing-plan':
      return (
        <div className='mt-8 flex w-full max-w-sm flex-col items-center'>
          <div className='text-base-content mb-8 text-xl font-normal'>
            <TextBlock text={block.name} />
          </div>
          <div className='text-primary mb-8 text-6xl font-extrabold'>
            <TextBlock text={block.price} />
          </div>
        </div>
      );
    case 'bullets':
    case 'highlight':
    case 'center':
      return null;
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
};
CenterBlock.displayName = 'CenterBlock';
