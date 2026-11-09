'use client';

import { NoSleep } from '@/components/routes/apps/utilities/NoSleep';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

const ToolUtilitiesNoSleep = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <NoSleep onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolUtilitiesNoSleep;
