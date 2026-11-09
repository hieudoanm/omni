'use client';

import { FC } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { Task } from '@/lib/office/tasks/types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: FC<TaskItemProps> = ({ task, onToggle, onDelete }) => (
  <div className='group flex items-center gap-2'>
    <input
      type='checkbox'
      className='checkbox checkbox-sm'
      checked={task.completed}
      onChange={() => onToggle(task.id)}
    />
    <span className={`flex-1 text-sm ${task.completed ? 'text-base-content/50 line-through' : ''}`}>
      {task.text}
    </span>
    <button
      className='btn btn-ghost btn-xs opacity-0 transition-opacity group-hover:opacity-100'
      onClick={() => onDelete(task.id)}>
      <FiTrash2 size={14} />
    </button>
  </div>
);

export default TaskItem;
