'use client';

import { useGlobe } from '@/hooks/use-globe';

const Page = () => {
  const { containerRef } = useGlobe();

  return <div ref={containerRef} />;
};

export default Page;
