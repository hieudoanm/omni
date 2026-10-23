import { fireEvent, render, screen } from '@testing-library/react';
import { MemberSwitcher } from '@/components/office/tasks/organisms/MemberSwitcher';

const mockUseAuth = jest.fn();
const mockUseData = jest.fn();

jest.mock('@/lib/office/tasks/auth', () => ({
  useAuth: () => mockUseAuth(),
}));
jest.mock('@/lib/office/tasks/data-provider', () => ({
  useData: () => mockUseData(),
}));

const users = [
  { id: 'mem-1', name: 'Alice Chen', email: 'a@x.io', avatar: 'AL' },
  { id: 'mem-2', name: 'Bob Smith', email: 'b@x.io', avatar: 'BO' },
];

describe('MemberSwitcher', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      currentUser: users[0],
      switchMember: jest.fn(),
      signOut: jest.fn(),
    });
    mockUseData.mockReturnValue({ members: users });
  });

  it('renders the current user avatar and name', () => {
    render(<MemberSwitcher />);
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByText('Alice Chen')).toBeInTheDocument();
  });

  it('renders a generic icon when signed out', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      switchMember: jest.fn(),
      signOut: jest.fn(),
    });
    render(<MemberSwitcher />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('opens the menu and switches member', () => {
    const switchMember = jest.fn();
    mockUseAuth.mockReturnValue({
      currentUser: users[0],
      switchMember,
      signOut: jest.fn(),
    });
    render(<MemberSwitcher />);
    fireEvent.click(screen.getByLabelText('Account menu'));
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Bob Smith'));
    expect(switchMember).toHaveBeenCalledWith('mem-2');
  });

  it('signs out from the open menu', () => {
    const signOut = jest.fn();
    mockUseAuth.mockReturnValue({
      currentUser: users[0],
      switchMember: jest.fn(),
      signOut,
    });
    render(<MemberSwitcher />);
    fireEvent.click(screen.getByLabelText('Account menu'));
    fireEvent.click(screen.getByText('Sign out'));
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('hides the name when collapsed', () => {
    render(<MemberSwitcher collapsed />);
    expect(screen.queryByText('Alice Chen')).not.toBeInTheDocument();
  });
});
