'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { OpenAPI2Postman } from '@/components/routes/apps/developer/OpenAPI2Postman';

const ToolDeveloperOpenapi = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <OpenAPI2Postman onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolDeveloperOpenapi;
