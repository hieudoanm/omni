import type { SidebarTab } from '@/components/organisms/layout/types';
import { getTimeInZone, timezones } from '@/data/timezones';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState, type FC } from 'react';
import { PiCurrencyDollar, PiGauge } from 'react-icons/pi';

const StatusTab = dynamic(
  () => import('@/components/organisms/layout/tabs/StatusTab').then((m) => m.StatusTab),
  { ssr: false },
);

const CurrencyTab = dynamic(
  () => import('@/components/organisms/layout/tabs/CurrencyTab').then((m) => m.CurrencyTab),
  { ssr: false },
);

const TABS: {
  id: SidebarTab;
  label: string;
  icon: FC<{ className?: string; size?: number }>;
}[] = [
  { id: 'status', label: 'Status', icon: PiGauge },
  { id: 'currency', label: 'Currency', icon: PiCurrencyDollar },
];

export const RightSidebar: FC = () => {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab | null>(null);
  const [times, setTimes] = useState(() => timezones.map(({ tz }) => getTimeInZone(tz)));

  useEffect(() => {
    const interval = setInterval(
      () => setTimes(timezones.map(({ tz }) => getTimeInZone(tz))),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = useCallback(
    (tab: SidebarTab) => setSidebarTab((prev: SidebarTab | null) => (prev === tab ? null : tab)),
    [],
  );

  const renderSidebarContent = useCallback(
    (tab: SidebarTab) => {
      switch (tab) {
        case 'status':
          return <StatusTab />;
        case 'currency':
          return <CurrencyTab />;
      }
    },
    [times],
  );

  return (
    <div className='flex'>
      {sidebarTab !== null && (
        <aside className='bg-base-200 border-base-300 flex w-80 shrink-0 flex-col overflow-hidden border-r'>
          <div className='min-h-0 flex-1 overflow-y-auto'>{renderSidebarContent(sidebarTab)}</div>
        </aside>
      )}
      <div className='bg-base-200 flex w-12 flex-col items-center gap-2 py-2'>
        {TABS.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className='tooltip tooltip-primary tooltip-left'
            data-tip={sidebarTab === id ? `Close ${label}` : `Open ${label}`}>
            <button
              onClick={() => toggleSidebar(id)}
              aria-label={sidebarTab === id ? `Close ${label}` : `Open ${label}`}
              className={`btn btn-ghost btn-square btn-sm ${sidebarTab === id ? 'bg-primary/20 text-primary' : 'text-base-content/60'}`}>
              <Icon className='h-5 w-5' />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

RightSidebar.displayName = 'RightSidebar';
