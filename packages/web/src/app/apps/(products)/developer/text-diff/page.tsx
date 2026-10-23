'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { TextDiff } from '@/components/routes/apps/developer/TextDiff';

const ToolDeveloperTextDiff = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <TextDiff onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolDeveloperTextDiff;
