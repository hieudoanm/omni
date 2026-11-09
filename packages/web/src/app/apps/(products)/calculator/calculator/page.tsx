'use client';

import { Calculator } from '@/components/routes/apps/calculator/Calculator';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

const ToolCalculatorCalculator = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <Calculator onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolCalculatorCalculator;
