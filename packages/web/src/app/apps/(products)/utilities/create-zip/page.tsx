'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { CreateZip } from '@/components/routes/apps/utilities/CreateZip';

const ToolUtilitiesCreateZip = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <CreateZip onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolUtilitiesCreateZip;
