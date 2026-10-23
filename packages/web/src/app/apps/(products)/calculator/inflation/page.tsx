'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Inflation } from '@/components/routes/apps/calculator/Inflation';

const ToolCalculatorInflation = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <Inflation onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolCalculatorInflation;
