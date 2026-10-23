import { GlyphLoading } from '@/components/atoms/GlyphLoading';
import { FC } from 'react';

const Loading: FC = () => (
  <div className='flex min-h-screen items-center justify-center'>
    <GlyphLoading />
  </div>
);

export default Loading;
