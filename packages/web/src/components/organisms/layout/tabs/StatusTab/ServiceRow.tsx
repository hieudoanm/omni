import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FC } from 'react';

export const ServiceRow: FC<{ service: string; url: string }> = ({ service, url }) => {
  const { isPending, error, data } = useQuery<{
    page: { id: string; name: string; url: string; time_zone: string };
    status: { indicator: string; description: string };
  }>({
    queryKey: ['status', service],
    queryFn: () => fetch(url).then((res) => res.json()),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const isOk: boolean = !error && data?.status?.indicator === 'none';
  const isErr: boolean = !!error || (!!data && data?.status?.indicator !== 'none');
  const pageUrl: string = data?.page.url || url;
  const pageName: string = data?.page?.name || service;

  return (
    <div className='hover:bg-base-300 group flex items-center justify-between rounded-full px-2 py-1.5 transition-colors duration-150'>
      <Link
        href={pageUrl}
        target='_blank'
        className='text-base-content/70 group-hover:text-base-content text-xs tracking-wide capitalize underline decoration-dotted transition-colors'>
        {pageName.replaceAll('-', ' ')}
      </Link>
      <div className='ml-2 shrink-0'>
        {isPending ? (
          <div className='bg-base-content/20 h-2 w-2 animate-pulse rounded-full' />
        ) : isOk ? (
          <div className='bg-base-content/60 h-2 w-2 rounded-full' />
        ) : isErr ? (
          <div className='bg-base-content/30 h-2 w-2 rounded-full' />
        ) : (
          <div className='bg-base-content/20 h-2 w-2 rounded-full' />
        )}
      </div>
    </div>
  );
};
ServiceRow.displayName = 'ServiceRow';
