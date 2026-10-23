import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const StatusGrid: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'System Status';
  const services = (data.services as { name: string; status: string }[]) ?? [
    { name: 'API', status: 'Operational' },
    { name: 'Database', status: 'Operational' },
    { name: 'CDN', status: 'Degraded' },
    { name: 'Auth', status: 'Operational' },
  ];

  const dotColor = (status: string) => {
    if (status === 'Operational') return 'bg-success';
    if (status === 'Degraded') return 'bg-warning';
    return 'bg-error';
  };

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-3 text-4xl font-bold'>{title}</h1>
      <ul className='grid flex-1 grid-cols-2 gap-2'>
        {services.map((service) => (
          <li
            key={service.name}
            className='bg-base-200 flex items-center justify-center gap-2 rounded-xl px-2 py-2'>
            <span className={`h-2.5 w-2.5 rounded-full ${dotColor(service.status)}`} />
            <div className='text-left'>
              <p className='text-base-content text-sm font-bold'>{service.name}</p>
              <p className='text-neutral text-xs'>{service.status}</p>
            </div>
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

StatusGrid.displayName = 'StatusGrid';
