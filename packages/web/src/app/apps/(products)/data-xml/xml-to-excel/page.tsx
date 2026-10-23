'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { XmlToExcel } from '@/components/routes/apps/data-xml/XmlToExcel';

const ToolDataXmlXmlToExcel = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <XmlToExcel onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolDataXmlXmlToExcel;
