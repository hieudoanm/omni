'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Proxy } from '@/components/routes/apps/developer/Proxy';

const ToolDeveloperProxy = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <Proxy onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolDeveloperProxy;
