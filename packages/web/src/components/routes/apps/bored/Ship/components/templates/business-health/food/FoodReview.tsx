import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const FoodReview: FC<TemplateProps> = ({ data }) => {
  const dish = (data.dish as string) ?? '';
  const restaurant = (data.restaurant as string) ?? '';
  const rating = (data.rating as number) ?? 0;
  const review = (data.review as string) ?? '';
  const imageUrl = (data.imageUrl as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-base-content text-4xl font-bold'>{dish}</h1>
          {restaurant && <p className='text-neutral mt-0.5 text-xs'>{restaurant}</p>}
        </div>
        <div className='flex gap-0.5'>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`h-4 w-4 ${star <= rating ? 'text-accent' : 'text-base-300'}`}
              fill='currentColor'
              viewBox='0 0 20 20'>
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
          ))}
        </div>
      </div>
      <blockquote className='text-base-content mt-5 text-sm leading-relaxed'>
        &ldquo;{review}&rdquo;
      </blockquote>
      <Footer citation={citation} />
    </Background>
  );
};

FoodReview.displayName = 'FoodReview';
