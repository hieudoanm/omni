'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { SplitExcel } from '@/components/routes/apps/data-excel/SplitExcel';

const ToolDataExcelSplitExcel = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <SplitExcel onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolDataExcelSplitExcel;
