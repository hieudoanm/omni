'use client';

import type { FC } from 'react';
import { FiX } from 'react-icons/fi';
import type { BoardFilters, Label, Member } from '@/lib/office/tasks/types';
import LabelFilters from '@/components/office/tasks/molecules/LabelFilters';
import MemberFilters from '@/components/office/tasks/molecules/MemberFilters';
import DueFilterSelect from '@/components/office/tasks/atoms/DueFilterSelect';
import PriorityFilterSelect from '@/components/office/tasks/atoms/PriorityFilterSelect';
import PresetsMenu from '@/components/office/tasks/molecules/PresetsMenu';

export type { BoardFilters, DueFilter, PriorityFilter, Preset } from '@/lib/office/tasks/types';

interface BoardFilterBarProps {
  boardId: string;
  labels: Label[];
  members: Member[];
  filters: BoardFilters;
  onChange: (filters: BoardFilters) => void;
}

const BoardFilterBar: FC<BoardFilterBarProps> = ({
  boardId,
  labels,
  members,
  filters,
  onChange,
}) => {
  const hasFilters =
    filters.activeLabel != null ||
    filters.activeMember != null ||
    filters.dueFilter !== 'all' ||
    filters.priorityFilter !== 'all';

  const clearAll = () =>
    onChange({
      activeLabel: null,
      activeMember: null,
      dueFilter: 'all',
      priorityFilter: 'all',
    });

  return (
    <div className='border-base-300 bg-base-100 flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2'>
      <LabelFilters
        labels={labels}
        activeLabel={filters.activeLabel}
        onChange={(activeLabel) => onChange({ ...filters, activeLabel })}
      />
      <MemberFilters
        members={members}
        activeMember={filters.activeMember}
        onChange={(activeMember) => onChange({ ...filters, activeMember })}
      />
      <DueFilterSelect
        value={filters.dueFilter}
        onChange={(dueFilter) => onChange({ ...filters, dueFilter })}
      />
      <PriorityFilterSelect
        value={filters.priorityFilter}
        onChange={(priorityFilter) => onChange({ ...filters, priorityFilter })}
      />
      {hasFilters && (
        <button type='button' onClick={clearAll} className='btn btn-ghost btn-xs'>
          <FiX className='size-3' /> Clear filters
        </button>
      )}
      <PresetsMenu boardId={boardId} filters={filters} onApply={onChange} />
    </div>
  );
};

export default BoardFilterBar;
