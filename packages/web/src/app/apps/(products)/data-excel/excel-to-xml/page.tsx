'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ExcelToXml } from '@/components/routes/apps/data-excel/ExcelToXml';

const ToolDataExcelExcelToXml = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <ExcelToXml onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolDataExcelExcelToXml;
