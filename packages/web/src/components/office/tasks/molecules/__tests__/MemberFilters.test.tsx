import { fireEvent, render, screen } from '@testing-library/react';
import MemberFilters from '@/components/office/tasks/molecules/MemberFilters';
import type { Member } from '@/lib/office/tasks/types';

const members: Member[] = [
  { id: 'm1', name: 'alice', email: 'a@x.io', avatar: 'AL' },
  { id: 'm2', name: 'bob', email: 'b@x.io', avatar: 'BO' },
];

describe('MemberFilters', () => {
  it('renders an avatar button per member initial', () => {
    render(<MemberFilters members={members} activeMember={null} onChange={() => {}} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('activates a member on click', () => {
    const onChange = jest.fn();
    render(<MemberFilters members={members} activeMember={null} onChange={onChange} />);
    fireEvent.click(screen.getByText('A'));
    expect(onChange).toHaveBeenCalledWith('m1');
  });

  it('deactivates the active member on click', () => {
    const onChange = jest.fn();
    render(<MemberFilters members={members} activeMember='m2' onChange={onChange} />);
    fireEvent.click(screen.getByText('B'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('adds a ring class for the active member', () => {
    render(<MemberFilters members={members} activeMember='m1' onChange={() => {}} />);
    expect(screen.getByText('A').closest('button')).toHaveClass('ring');
  });
});
