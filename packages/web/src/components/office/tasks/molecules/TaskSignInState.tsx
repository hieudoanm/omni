'use client';

import { type FC } from 'react';
import { PiUserCircle } from 'react-icons/pi';

interface TaskSignInStateProps {
  onSignIn: () => void;
}

export const TaskSignInState: FC<TaskSignInStateProps> = ({ onSignIn }) => (
  <div className='flex flex-col items-center justify-center gap-3 px-6 py-14 text-center'>
    <div className='bg-base-200 flex h-14 w-14 items-center justify-center rounded-full'>
      <PiUserCircle className='text-primary size-7' />
    </div>
    <div>
      <h3 className='text-base-content text-sm font-semibold'>Sign in to view your tasks</h3>
      <p className='text-base-content/50 mt-1 text-xs'>
        Choose an account to see your task list and manage your work.
      </p>
    </div>
    <button type='button' onClick={onSignIn} className='btn btn-primary btn-sm'>
      Sign in
    </button>
  </div>
);

TaskSignInState.displayName = 'TaskSignInState';
