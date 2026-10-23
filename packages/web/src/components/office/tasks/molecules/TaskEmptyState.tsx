'use client';

import { type FC } from 'react';
import { PiListChecks } from 'react-icons/pi';

interface TaskEmptyStateProps {
  title?: string;
  description?: string;
}

export const TaskEmptyState: FC<TaskEmptyStateProps> = ({
  title = 'No tasks yet',
  description = 'Add your first task above to get started.',
}) => (
  <div className='flex flex-col items-center justify-center gap-3 px-6 py-14 text-center'>
    <div className='bg-base-200 flex h-14 w-14 items-center justify-center rounded-full'>
      <PiListChecks className='text-primary size-7' />
    </div>
    <div>
      <h3 className='text-base-content text-sm font-semibold'>{title}</h3>
      <p className='text-base-content/50 mt-1 text-xs'>{description}</p>
    </div>
  </div>
);

TaskEmptyState.displayName = 'TaskEmptyState';
