import { render, screen, waitFor } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useSearchParams: () =>
    new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''),
}));

jest.mock('@/components/office/tasks/Providers', () => ({
  TasksProviders: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseData = jest.fn();
jest.mock('@/lib/office/tasks/data-provider', () => ({
  useData: () => mockUseData(),
}));

const mockProjectSidebar = jest.fn();
jest.mock('@/components/office/tasks/organisms/ProjectSidebar', () => ({
  ProjectSidebar: (props: Record<string, unknown>) => {
    mockProjectSidebar(props);
    return <div data-testid='sidebar' />;
  },
}));

const mockBoardBody = jest.fn();
jest.mock('@/components/office/tasks/organisms/BoardBody', () => ({
  BoardBody: (props: Record<string, unknown>) => {
    mockBoardBody(props);
    return <div data-testid='boardbody' />;
  },
}));

import TasksPage from '@/app/apps/office/tasks/page';

describe('TasksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseData.mockReturnValue({
      boards: [
        { id: 'b1', name: 'Roadmap' },
        { id: 'b2', name: 'Sprint' },
      ],
      settings: { defaultView: 'list' },
      isLoading: false,
    });
  });

  it('renders sidebar and board body', async () => {
    render(<TasksPage />);
    expect(await screen.findByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('boardbody')).toBeInTheDocument();
  });

  it('selects the requested board from the URL', async () => {
    render(<TasksPage />);
    await screen.findByTestId('boardbody');
    expect(mockBoardBody).toHaveBeenCalledWith(
      expect.objectContaining({ boardId: 'b1', view: 'list' }),
    );
  });

  it('surfaces view change through the onViewChange callback', async () => {
    render(<TasksPage />);
    await screen.findByTestId('boardbody');
    const props = mockBoardBody.mock.calls[0][0] as {
      onViewChange: (v: string) => void;
    };
    props.onViewChange('calendar');
    await waitFor(() => {
      const next = mockBoardBody.mock.calls.at(-1)![0] as { view: string };
      expect(next.view).toBe('calendar');
    });
  });

  it('uses the default kanban view when defaultView is not set', async () => {
    mockUseData.mockReturnValue({
      boards: [{ id: 'b1', name: 'Roadmap' }],
      settings: { defaultView: undefined },
      isLoading: false,
    });
    render(<TasksPage />);
    await screen.findByTestId('boardbody');
    expect(mockBoardBody).toHaveBeenCalledWith(expect.objectContaining({ view: 'kanban' }));
  });

  it('passes isLoading to the board body', async () => {
    mockUseData.mockReturnValue({
      boards: [{ id: 'b1', name: 'Roadmap' }],
      settings: { defaultView: 'kanban' },
      isLoading: true,
    });
    render(<TasksPage />);
    await screen.findByTestId('boardbody');
    expect(mockBoardBody).toHaveBeenCalledWith(expect.objectContaining({ isLoading: true }));
  });

  it('falls back to the first board when the requested id is not found', async () => {
    render(<TasksPage />);
    await screen.findByTestId('boardbody');
    expect(mockBoardBody).toHaveBeenCalledWith(expect.objectContaining({ boardId: 'b1' }));
  });
});
