'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Tax } from '@/components/routes/apps/calculator/Tax';

const ToolCalculatorTax = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <Tax onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolCalculatorTax;
