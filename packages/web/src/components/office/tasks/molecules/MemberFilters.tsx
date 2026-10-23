'use client';

import { FC } from 'react';
import { Member } from '@/lib/office/tasks/types';

interface MemberFiltersProps {
  members: Member[];
  activeMember: string | null;
  onChange: (memberId: string | null) => void;
}

const MemberFilters: FC<MemberFiltersProps> = ({ members, activeMember, onChange }) => (
  <div className='flex gap-1'>
    {members.map((member) => (
      <button
        key={member.id}
        className={`avatar placeholder cursor-pointer ${
          activeMember === member.id ? 'ring-primary ring-offset-base-100 ring ring-offset-2' : ''
        }`}
        onClick={() => onChange(activeMember === member.id ? null : member.id)}
        title={member.name}>
        <div className='bg-neutral text-neutral-content h-8 w-8 rounded-full'>
          <span className='text-xs'>{member.name.charAt(0).toUpperCase()}</span>
        </div>
      </button>
    ))}
  </div>
);

export default MemberFilters;
