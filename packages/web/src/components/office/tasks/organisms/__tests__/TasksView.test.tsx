import { fireEvent, render, screen } from '@testing-library/react';
import { TasksView } from '@/components/office/tasks/organisms/TasksView';

const mockUseAuth = jest.fn();
const mockUseData = jest.fn();

jest.mock('@/lib/office/tasks/auth', () => ({
  useAuth: () => mockUseAuth(),
}));
jest.mock('@/lib/office/tasks/data-provider', () => ({
  useData: () => mockUseData(),
}));

const user = { id: 'mem-1', name: 'Alice', email: 'a@x.io', avatar: 'A' };

describe('TasksView', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ currentUser: user, switchMember: jest.fn() });
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [],
      addTask: jest.fn(),
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
    });
  });

  it('shows the sign-in state when no user is present', () => {
    mockUseAuth.mockReturnValue({ currentUser: null, switchMember: jest.fn() });
    render(<TasksView />);
    expect(screen.getByText('Sign in to view your tasks')).toBeInTheDocument();
  });

  it('shows the empty state when there are no tasks', () => {
    render(<TasksView />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('renders tasks sorted incomplete first then by recency', () => {
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [
        {
          id: 't1',
          userId: 'mem-1',
          text: 'Old done',
          completed: true,
          createdAt: 2,
          updatedAt: 2,
        },
        {
          id: 't2',
          userId: 'mem-1',
          text: 'New pending',
          completed: false,
          createdAt: 4,
          updatedAt: 4,
        },
        {
          id: 't3',
          userId: 'mem-1',
          text: 'Old pending',
          completed: false,
          createdAt: 3,
          updatedAt: 3,
        },
      ],
      addTask: jest.fn(),
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
    });
    render(<TasksView />);
    const container = screen.getByText('New pending').closest('ul')!;
    const texts = Array.from(container.querySelectorAll('.flex-1')).map((el) => el.textContent);
    expect(texts).toEqual(['New pending', 'Old pending', 'Old done']);
  });

  it('calls addTask when a new task is submitted', () => {
    const addTask = jest.fn();
    mockUseData.mockReturnValue({
      members: [user],
      tasks: [],
      addTask,
      toggleTask: jest.fn(),
      deleteTask: jest.fn(),
    });
    render(<TasksView />);
    fireEvent.change(screen.getByPlaceholderText('Add a task...'), {
      target: { value: 'Buy milk' },
    });
    fireEvent.click(screen.getByText('Add'));
    expect(addTask).toHaveBeenCalledWith('mem-1', 'Buy milk');
  });
});
