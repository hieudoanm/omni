'use client';

import { FC, useState } from 'react';
import { TasksProviders } from '@/components/office/tasks/Providers';
import { TaskEmptyState } from '@/components/office/tasks/molecules/TaskEmptyState';
import { TaskSignInState } from '@/components/office/tasks/molecules/TaskSignInState';
import { useAuth } from '@/lib/office/tasks/auth';
import { useData } from '@/lib/office/tasks/data-provider';
import type { Task } from '@/lib/office/tasks/types';

const sortTasks = (tasks: Task[]): Task[] => {
  const sorted = [...tasks];
  sorted.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  return sorted;
};

const LiteTasksContent: FC = () => {
  const { currentUser, switchMember } = useAuth();
  const { members, tasks, addTask, toggleTask, deleteTask, isLoading } = useData();
  const [newTask, setNewTask] = useState('');

  if (isLoading) {
    return (
      <main className='bg-base-100 flex min-h-[50vh] items-center justify-center'>
        <span className='loading loading-spinner loading-lg' />
      </main>
    );
  }

  if (!currentUser) {
    const signIn = () => {
      const first = members[0];
      if (first) switchMember(first.id);
    };
    return (
      <main className='bg-base-100 mx-auto flex max-w-xl flex-col p-4 sm:p-6'>
        <h1 className='mb-4 text-center text-lg font-bold'>Tasks</h1>
        <TaskSignInState onSignIn={signIn} />
      </main>
    );
  }

  const userTasks = tasks.filter((t) => t.userId === currentUser.id);
  const pending = userTasks.filter((t) => !t.completed).length;

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    await addTask(currentUser.id, newTask.trim());
    setNewTask('');
  };

  return (
    <main className='bg-base-100 mx-auto flex max-w-xl flex-col gap-0 p-4 sm:p-6'>
      <h1 className='mb-4 text-center text-lg font-bold'>Tasks</h1>
      <div className='mb-4 flex gap-2'>
        <input
          type='text'
          placeholder='New task...'
          aria-label='New task'
          className='input input-bordered input-sm flex-1'
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          type='button'
          aria-label='Add task'
          className='btn btn-primary btn-sm btn-circle'
          onClick={handleAdd}
          disabled={!newTask.trim()}>
          +
        </button>
      </div>
      {userTasks.length === 0 ? (
        <TaskEmptyState />
      ) : (
        <ul className='flex flex-col gap-0.5'>
          {sortTasks(userTasks).map((task) => (
            <li
              key={task.id}
              className='hover:bg-base-300 flex items-center gap-2 rounded-full px-2 py-2 transition-colors'>
              <input
                type='checkbox'
                aria-label={`Toggle ${task.text}`}
                className='checkbox checkbox-primary checkbox-sm shrink-0'
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />
              <span
                className={`flex-1 truncate text-sm ${
                  task.completed ? 'text-base-content/30 line-through' : ''
                }`}>
                {task.text}
              </span>
              <button
                type='button'
                aria-label={`Delete ${task.text}`}
                className='btn btn-ghost btn-xs btn-circle text-error shrink-0 opacity-0 hover:opacity-100 [li:hover_&]:opacity-100'
                onClick={() => deleteTask(task.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <footer className='mt-auto pt-8 text-center font-mono'>
        <p className='text-xs tracking-widest uppercase opacity-20'>
          {pending} pending · {userTasks.length} total
        </p>
      </footer>
    </main>
  );
};

const LiteTasksPage: FC = () => (
  <TasksProviders>
    <LiteTasksContent />
  </TasksProviders>
);

export default LiteTasksPage;
