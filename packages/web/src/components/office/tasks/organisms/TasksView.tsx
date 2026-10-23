'use client';

import { useAuth } from '@/lib/office/tasks/auth';
import { useData } from '@/lib/office/tasks/data-provider';
import { type FC } from 'react';
import type { Task } from '@/lib/office/tasks/types';
import TaskInput from '@/components/office/tasks/molecules/TaskInput';
import TaskItem from '@/components/office/tasks/molecules/TaskItem';
import { TaskEmptyState } from '@/components/office/tasks/molecules/TaskEmptyState';
import { TaskSignInState } from '@/components/office/tasks/molecules/TaskSignInState';

const sortTasks = (tasks: Task[]): Task[] => {
  const sorted = [...tasks];
  sorted.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.updatedAt - a.updatedAt;
  });
  return sorted;
};

export const TasksView: FC = () => {
  const { currentUser, switchMember } = useAuth();
  const { members, tasks, addTask, toggleTask, deleteTask } = useData();

  if (!currentUser) {
    const signIn = () => {
      const first = members[0];
      if (first) switchMember(first.id);
    };
    return (
      <div className='flex h-full items-center justify-center'>
        <TaskSignInState onSignIn={signIn} />
      </div>
    );
  }

  const userTasks = tasks.filter((t) => t.userId === currentUser.id);
  const pending = userTasks.filter((t) => !t.completed).length;

  return (
    <div className='flex h-full flex-col'>
      <div className='border-base-300 bg-base-100 border-b p-3'>
        <TaskInput onAdd={(text) => addTask(currentUser.id, text)} />
      </div>
      <div className='flex flex-1 flex-col overflow-y-auto'>
        {userTasks.length === 0 ? (
          <div className='flex flex-1 items-center justify-center'>
            <TaskEmptyState />
          </div>
        ) : (
          <ul className='flex flex-col gap-0.5 p-3'>
            {sortTasks(userTasks).map((task) => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </ul>
        )}
      </div>
      <footer className='border-base-300 bg-base-100 border-t px-4 py-4 text-center font-mono'>
        <p className='text-xs tracking-widest uppercase opacity-20'>
          {pending} pending · {userTasks.length} total
        </p>
      </footer>
    </div>
  );
};

TasksView.displayName = 'TasksView';
