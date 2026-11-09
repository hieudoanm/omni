'use client';

import { type FC, useState } from 'react';
import { FiBarChart2, FiDroplet, FiLayout, FiLayers, FiSettings, FiZap } from 'react-icons/fi';
import { FormatPanel } from '@/components/office/keynotes/organisms/panels/FormatPanel';
import { ArrangePanel } from '@/components/office/keynotes/organisms/panels/ArrangePanel';
import { AnimationsPanel } from '@/components/office/keynotes/organisms/panels/AnimationsPanel';
import { ThemePanel } from '@/components/office/keynotes/organisms/panels/ThemePanel';
import { TransitionsPanel } from '@/components/office/keynotes/organisms/panels/TransitionsPanel';
import { MasterPanel } from '@/components/office/keynotes/organisms/panels/MasterPanel';

const TABS = [
  { id: 'format', label: 'Format', icon: FiBarChart2 },
  { id: 'arrange', label: 'Arrange', icon: FiLayers },
  { id: 'animate', label: 'Animate', icon: FiZap },
  { id: 'theme', label: 'Theme', icon: FiDroplet },
  { id: 'master', label: 'Master', icon: FiLayout },
  { id: 'transitions', label: 'Transitions', icon: FiSettings },
] as const;

export const RightPanel: FC = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('format');

  return (
    <aside className='border-base-300 bg-base-200 flex w-72 shrink-0 flex-col border-l'>
      <div className='border-base-300 flex h-11 shrink-0 items-center border-b px-1'>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type='button'
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] ${
                tab === t.id ? 'border-primary text-primary' : 'text-base-content/50'
              } border-b-2`}
              title={t.label}>
              <Icon className='size-4' />
              {t.label}
            </button>
          );
        })}
      </div>
      <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto'>
        {tab === 'format' && <FormatPanel />}
        {tab === 'arrange' && <ArrangePanel />}
        {tab === 'animate' && <AnimationsPanel />}
        {tab === 'theme' && <ThemePanel />}
        {tab === 'master' && <MasterPanel />}
        {tab === 'transitions' && <TransitionsPanel />}
      </div>
    </aside>
  );
};
