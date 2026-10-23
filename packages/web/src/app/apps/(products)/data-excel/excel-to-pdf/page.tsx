'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ExcelToPdf } from '@/components/routes/apps/data-excel/ExcelToPdf';

const ToolDataExcelExcelToPdf = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <ExcelToPdf onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolDataExcelExcelToPdf;
