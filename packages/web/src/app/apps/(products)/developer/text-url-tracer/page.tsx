'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { TextUrlTracer } from '@/components/routes/apps/developer/TextUrlTracer';

const ToolDeveloperTextUrlTracer = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <TextUrlTracer onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolDeveloperTextUrlTracer;
