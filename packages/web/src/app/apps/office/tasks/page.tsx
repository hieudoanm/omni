'use client';

import { TasksProviders } from '@/components/office/tasks/Providers';
import { BoardBody } from '@/components/office/tasks/organisms/BoardBody';
import { ProjectSidebar } from '@/components/office/tasks/organisms/ProjectSidebar';
import type { ViewMode } from '@/components/office/tasks/organisms/ViewSwitcher';
import { useData } from '@/lib/office/tasks/data-provider';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type FC } from 'react';

const normalizeView = (value: string): ViewMode =>
  value === 'list' || value === 'calendar' || value === 'timeline' ? value : 'kanban';

const AppShell: FC = () => {
  const { boards, settings, isLoading } = useData();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('id');
  const activeBoard = boards.find((b) => b.id === requestedId) ?? boards[0];

  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [view, setView] = useState<ViewMode>(() =>
    normalizeView(settings?.defaultView ?? 'kanban'),
  );
  const viewTouched = useRef(false);

  useEffect(() => {
    if (!isLoading && !viewTouched.current) {
      setView(normalizeView(settings?.defaultView ?? 'kanban'));
    }
  }, [isLoading, settings?.defaultView]);

  const handleViewChange = (next: ViewMode) => {
    viewTouched.current = true;
    setView(next);
  };

  return (
    <div className='flex h-screen overflow-hidden'>
      <ProjectSidebar
        search={search}
        onSearchChange={setSearch}
        searchRef={searchRef}
        onOpenArchive={() => setShowArchive(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
      />
      <BoardBody
        isLoading={isLoading}
        boardId={activeBoard?.id}
        view={view}
        onViewChange={handleViewChange}
        search={search}
        searchRef={searchRef}
        showArchive={showArchive}
        setShowArchive={setShowArchive}
      />
    </div>
  );
};

const TasksPage: FC = () => (
  <TasksProviders>
    <Suspense fallback={null}>
      <AppShell />
    </Suspense>
  </TasksProviders>
);

export default TasksPage;
