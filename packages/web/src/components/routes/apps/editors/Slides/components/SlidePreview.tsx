import { FC } from 'react';

import { CenterBlock } from './CenterBlock';
import { TextBlock } from './TextBlock';
import { SlideLayout } from '../types';

export const SlidePreview: FC<{ slide: SlideLayout; index: number }> = ({ slide, index }) => (
  <div className='group bg-base-100 border-primary-content relative mx-auto aspect-video h-[720px] w-[1280px] cursor-default border p-14 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl'>
    <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500 to-transparent opacity-0 transition-opacity group-hover:opacity-20' />
    <div className='flex items-start justify-between'>
      {slide.kicker && (
        <div className='text-base-content/70 mb-8 text-lg font-normal uppercase'>
          <TextBlock text={slide.kicker} />
        </div>
      )}
      <div className='text-base-content font-mono text-lg'>
        <TextBlock text={`${index + 1} / 5`} />
      </div>
    </div>
    <div className='flex h-full flex-col'>
      {slide.blocks.map((block, i) => {
        switch (block.type) {
          case 'title':
            return (
              <TextBlock
                key={i}
                text={block.text}
                className='text-base-content mb-8 text-5xl font-normal'
              />
            );
          case 'subtitle':
            return (
              <TextBlock
                key={i}
                text={block.text}
                className='text-primary mb-8 text-2xl font-normal'
              />
            );
          case 'text':
            return (
              <TextBlock key={i} text={block.text} className='text-neutral-content text-2xl' />
            );
          case 'center': {
            const pricingPlans = block.blocks.filter((b) => b.type === 'pricing-plan');
            const contentBlocks = block.blocks.filter((b) => b.type !== 'pricing-plan');
            return (
              <div className='-mt-16 flex h-full flex-col items-center justify-center text-center'>
                {contentBlocks.map((child, ci) => (
                  <CenterBlock key={`text-${ci}`} block={child} />
                ))}
                {pricingPlans.length > 0 && (
                  <div className='mt-12 flex items-center justify-center'>
                    {pricingPlans.map((plan, pi) => (
                      <div key={pi} className='flex items-start'>
                        <CenterBlock block={plan} />
                        {pi < pricingPlans.length - 1 && (
                          <span className='text-base-100 mx-12 text-9xl font-light'>|</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          case 'bullets':
            return (
              <ul key={i} className='space-y-6'>
                {block.items.map((item, j) => (
                  <li key={j} className='flex gap-4'>
                    <span className='text-3xl'>{item.emoji}</span>
                    <div>
                      <div className='text-base-content text-2xl font-normal'>
                        <TextBlock text={item.title ?? ''} />
                      </div>
                      {item.description && (
                        <div className='text-neutral-content text-xl'>
                          <TextBlock text={item.description ?? ''} />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            );
          case 'highlight':
          case 'pricing-plan':
            return null;
          default: {
            const _exhaustive: never = block;
            return _exhaustive;
          }
        }
      })}
    </div>
  </div>
);
SlidePreview.displayName = 'SlidePreview';
