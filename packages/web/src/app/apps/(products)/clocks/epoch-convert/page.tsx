'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { EpochConvert } from '@/components/routes/apps/clocks/EpochConvert';

const ToolClocksEpochConvert = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <EpochConvert onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolClocksEpochConvert;
