'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { JSONSchema } from '@/components/routes/apps/editors/JSONSchema';
import { NextPage } from 'next';

const ToolEditorsJsonSchema: NextPage = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <JSONSchema onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolEditorsJsonSchema;
