'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { XmlToJson } from '@/components/routes/apps/data-xml/XmlToJson';

const ToolDataXmlXmlToJson = () => {
  const router = useRouter();
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <span className='loading loading-spinner loading-md' />
        </div>
      }>
      <XmlToJson onClose={() => router.push('/apps')} />
    </Suspense>
  );
};

export default ToolDataXmlXmlToJson;
