'use client';

import { type FC, type RefObject } from 'react';
import { CalendarView } from '@/components/office/tasks/organisms/CalendarView';
import { KanbanBoard } from '@/components/office/tasks/organisms/KanbanBoard';
import { ListView } from '@/components/office/tasks/organisms/ListView';
import { TimelineView } from '@/components/office/tasks/organisms/TimelineView';
import { ViewSwitcher, type ViewMode } from '@/components/office/tasks/organisms/ViewSwitcher';

interface BoardBodyProps {
  isLoading: boolean;
  boardId: string | undefined;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  search: string;
  searchRef: RefObject<HTMLInputElement | null>;
  showArchive: boolean;
  setShowArchive: (open: boolean) => void;
}

export const BoardBody: FC<BoardBodyProps> = ({
  isLoading,
  boardId,
  view,
  onViewChange,
  search,
  searchRef,
  showArchive,
  setShowArchive,
}) => {
  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <span className='loading loading-spinner loading-lg' />
      </div>
    );
  }

  if (!boardId) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <p className='text-base-content/50'>No projects yet. Create one from the sidebar.</p>
      </div>
    );
  }

  return (
    <div className='flex min-w-0 flex-1 flex-col'>
      <ViewSwitcher value={view} onChange={onViewChange} />
      {view === 'kanban' && (
        <KanbanBoard
          key={boardId}
          boardId={boardId}
          search={search}
          searchRef={searchRef}
          showArchive={showArchive}
          setShowArchive={setShowArchive}
        />
      )}
      {view === 'list' && <ListView key={boardId} boardId={boardId} />}
      {view === 'calendar' && <CalendarView key={boardId} boardId={boardId} />}
      {view === 'timeline' && <TimelineView key={boardId} boardId={boardId} />}
    </div>
  );
};

BoardBody.displayName = 'BoardBody';
