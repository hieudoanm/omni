'use client';

import { useAuth } from '@/lib/office/tasks/auth';
import { useData } from '@/lib/office/tasks/data-provider';
import { useState, type FC } from 'react';
import { FiCheck, FiLogOut, FiUser } from 'react-icons/fi';

export const MemberSwitcher: FC<{ collapsed?: boolean }> = ({ collapsed = false }) => {
  const { currentUser, switchMember, signOut } = useAuth();
  const { members } = useData();
  const [open, setOpen] = useState(false);

  return (
    <div className='relative'>
      <button
        type='button'
        aria-label='Account menu'
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`btn btn-ghost btn-sm gap-2 ${collapsed ? 'btn-circle' : 'justify-start'}`}>
        {currentUser ? (
          <span className='bg-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'>
            {currentUser.avatar}
          </span>
        ) : (
          <span className='bg-base-300 flex h-7 w-7 shrink-0 items-center justify-center rounded-full'>
            <FiUser className='size-4' />
          </span>
        )}
        {!collapsed && (
          <span className='truncate text-sm'>{currentUser ? currentUser.name : 'Sign in'}</span>
        )}
      </button>

      {open && (
        <div
          role='menu'
          aria-label='Account'
          className='bg-base-100 border-base-300 absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border shadow-xl'>
          <div className='border-base-300 flex flex-col gap-0.5 border-b p-1.5'>
            {members.map((member) => {
              const active = member.id === currentUser?.id;
              return (
                <button
                  key={member.id}
                  type='button'
                  role='menuitem'
                  onClick={() => {
                    switchMember(member.id);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                    active ? 'bg-primary/10 font-semibold' : 'hover:bg-base-200'
                  }`}>
                  <span className='bg-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white'>
                    {member.avatar}
                  </span>
                  <span className='truncate'>{member.name}</span>
                  {active && <FiCheck className='text-primary ml-auto size-4' />}
                </button>
              );
            })}
          </div>
          {currentUser && (
            <button
              type='button'
              role='menuitem'
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className='hover:bg-base-200 text-error flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm'>
              <FiLogOut className='size-4' /> Sign out
            </button>
          )}
        </div>
      )}
    </div>
  );
};

MemberSwitcher.displayName = 'MemberSwitcher';
