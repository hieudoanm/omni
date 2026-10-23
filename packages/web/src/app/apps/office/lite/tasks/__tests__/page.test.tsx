import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FC } from 'react';

const mockUseAuth = jest.fn();
const mockUseData = jest.fn();

jest.mock('@/components/office/tasks/Providers', () => ({
  TasksProviders: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@/lib/office/tasks/auth', () => ({
  useAuth: () => mockUseAuth(),
}));
jest.mock('@/lib/office/tasks/data-provider', () => ({
  useData: () => mockUseData(),
}));
jest.mock('@/components/office/tasks/molecules/TaskEmptyState', () => ({
  TaskEmptyState: () => <div>Empty tasks</div>,
}));
jest.mock('@/components/office/tasks/molecules/TaskSignInState', () => ({
  TaskSignInState: ({ onSignIn }: { onSignIn: () => void }) => (
    <button onClick={onSignIn}>Sign in</button>
  ),
}));

import LiteTasksPage from '@/app/apps/office/lite/tasks/page';

const user = { id: 'mem-1', name: 'Alice', email: 'a@x.io', avatar: 'A' };

describe('LiteTasksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ currentUser: user, switchMember: jest.fn() });
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [],
      addTask: jest.fn(),
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
      isLoading: false,
    });
  });

  it('shows a spinner while loading', () => {
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [],
      addTask: jest.fn(),
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
      isLoading: true,
    });
    render(<LiteTasksPage />);
    expect(
      screen.getByText((_, el) => el?.className === 'loading loading-spinner loading-lg'),
    ).toBeInTheDocument();
  });

  it('shows the sign-in state when signed out', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      switchMember: jest.fn(),
    });
    render(<LiteTasksPage />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('signs in as the first member', () => {
    const switchMember = jest.fn();
    mockUseAuth.mockReturnValue({ currentUser: null, switchMember });
    render(<LiteTasksPage />);
    fireEvent.click(screen.getByText('Sign in'));
    expect(switchMember).toHaveBeenCalledWith('mem-1');
  });

  it('does nothing on sign in when there are no members', () => {
    const switchMember = jest.fn();
    mockUseAuth.mockReturnValue({ currentUser: null, switchMember });
    mockUseData.mockReturnValue({
      members: [],
      tasks: [],
      addTask: jest.fn(),
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
      isLoading: false,
    });
    render(<LiteTasksPage />);
    fireEvent.click(screen.getByText('Sign in'));
    expect(switchMember).not.toHaveBeenCalled();
  });

  it('shows the empty state when there are no tasks', () => {
    render(<LiteTasksPage />);
    expect(screen.getByText('Empty tasks')).toBeInTheDocument();
    expect(screen.getByText('0 pending · 0 total')).toBeInTheDocument();
  });

  it('adds a task on button click', async () => {
    const addTask = jest.fn().mockResolvedValue(undefined);
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [],
      addTask,
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
      isLoading: false,
    });
    render(<LiteTasksPage />);
    fireEvent.change(screen.getByLabelText('New task'), {
      target: { value: 'Buy milk' },
    });
    fireEvent.click(screen.getByLabelText('Add task'));
    await waitFor(() => expect(addTask).toHaveBeenCalledWith('mem-1', 'Buy milk'));
  });

  it('adds a task on Enter key', async () => {
    const addTask = jest.fn().mockResolvedValue(undefined);
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [],
      addTask,
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
      isLoading: false,
    });
    render(<LiteTasksPage />);
    fireEvent.change(screen.getByLabelText('New task'), {
      target: { value: 'Walk dog' },
    });
    fireEvent.keyDown(screen.getByLabelText('New task'), { key: 'Enter' });
    await waitFor(() => expect(addTask).toHaveBeenCalledWith('mem-1', 'Walk dog'));
  });

  it('toggles and deletes tasks', async () => {
    const toggleTask = jest.fn().mockResolvedValue(undefined);
    const deleteTask = jest.fn().mockResolvedValue(undefined);
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [
        {
          id: 't1',
          userId: 'mem-1',
          text: 'Do laundry',
          completed: false,
          createdAt: 1,
          updatedAt: 1,
        },
      ],
      addTask: jest.fn(),
      toggleTask,
      deleteTask,
      isLoading: false,
    });
    render(<LiteTasksPage />);
    fireEvent.click(screen.getByLabelText('Toggle Do laundry'));
    await waitFor(() => expect(toggleTask).toHaveBeenCalledWith('t1'));
    fireEvent.click(screen.getByLabelText('Delete Do laundry'));
    await waitFor(() => expect(deleteTask).toHaveBeenCalledWith('t1'));
  });

  it('sorts pending tasks before completed', () => {
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [
        {
          id: 't1',
          userId: 'mem-1',
          text: 'Old done',
          completed: true,
          createdAt: 1,
          updatedAt: 1,
        },
        {
          id: 't2',
          userId: 'mem-1',
          text: 'New pending',
          completed: false,
          createdAt: 3,
          updatedAt: 3,
        },
        {
          id: 't3',
          userId: 'mem-1',
          text: 'Old pending',
          completed: false,
          createdAt: 2,
          updatedAt: 2,
        },
      ],
      addTask: jest.fn(),
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
      isLoading: false,
    });
    render(<LiteTasksPage />);
    const list = screen.getByRole('list');
    const texts = Array.from(list.querySelectorAll('.flex-1')).map((el) => el.textContent);
    expect(texts).toEqual(['New pending', 'Old pending', 'Old done']);
  });

  it('sorts completed tasks after pending even when they come first', () => {
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [
        {
          id: 't2',
          userId: 'mem-1',
          text: 'Later pending',
          completed: false,
          createdAt: 9,
          updatedAt: 9,
        },
        {
          id: 't1',
          userId: 'mem-1',
          text: 'Earlier done',
          completed: true,
          createdAt: 1,
          updatedAt: 1,
        },
      ],
      addTask: jest.fn(),
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
      isLoading: false,
    });
    render(<LiteTasksPage />);
    const list = screen.getByRole('list');
    const texts = Array.from(list.querySelectorAll('.flex-1')).map((el) => el.textContent);
    expect(texts).toEqual(['Later pending', 'Earlier done']);
  });

  it('ignores an empty new task on Enter', async () => {
    const addTask = jest.fn().mockResolvedValue(undefined);
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [],
      addTask,
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
      isLoading: false,
    });
    render(<LiteTasksPage />);
    const input = screen.getByLabelText('New task');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(addTask).not.toHaveBeenCalled();
  });
});
