'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Regex } from '@/components/routes/apps/editors/Regex';
import { NextPage } from 'next';

const ToolEditorsRegex: NextPage = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <Regex onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolEditorsRegex;
