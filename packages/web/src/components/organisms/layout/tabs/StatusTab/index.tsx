import { FC, useMemo, useState } from 'react';

import { ServiceRow } from './ServiceRow';
import { STATUS_SERVICES, totalCount } from './constants';

export const StatusTab: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return STATUS_SERVICES;

    const filtered: Record<string, Record<string, string>> = {};

    Object.entries(STATUS_SERVICES).forEach(([category, services]) => {
      const matchingServices: Record<string, string> = {};
      Object.entries(services).forEach(([service, url]) => {
        if (service.toLowerCase().includes(query) || category.toLowerCase().includes(query)) {
          matchingServices[service] = url;
        }
      });

      if (Object.keys(matchingServices).length > 0) {
        filtered[category] = matchingServices;
      }
    });

    return filtered;
  }, [searchQuery]);

  const filteredCount = useMemo(() => {
    return Object.values(filteredServices).reduce((acc, s) => acc + Object.keys(s).length, 0);
  }, [filteredServices]);

  return (
    <div className='flex h-full flex-col'>
      <div className='border-base-300 border-b p-3'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search services…'
            className='input input-bordered input-xs w-full pr-6'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='text-base-content/50 hover:text-base-content absolute top-1/2 right-2 -translate-y-1/2 text-[10px]'
              title='Clear search'>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='flex flex-col gap-4 p-3'>
          {Object.entries(filteredServices).map(([category, services]) => (
            <div key={category}>
              <p className='text-base-content/30 mb-1.5 px-2 font-mono text-[10px] tracking-widest uppercase'>
                {category}
              </p>
              <div className='flex flex-col gap-0.5'>
                {Object.entries(services).map(([service, url]) => (
                  <ServiceRow key={service} service={service} url={url} />
                ))}
              </div>
            </div>
          ))}
          {filteredCount === 0 && (
            <p className='text-base-content/25 py-8 text-center text-xs'>
              No matching services found.
            </p>
          )}
        </div>
      </div>
      <footer className='border-base-300 border-t px-4 py-4 text-center font-mono'>
        <p className='text-xs tracking-widest uppercase opacity-20'>
          {searchQuery.trim()
            ? `${filteredCount} found · ${totalCount} services`
            : `${totalCount} services · 2 min refresh`}
        </p>
      </footer>
    </div>
  );
};
StatusTab.displayName = 'StatusTab';
