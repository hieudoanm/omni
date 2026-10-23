import { render, screen } from '@testing-library/react';
import { createRef, type RefObject } from 'react';
import { BoardBody } from '@/components/office/tasks/organisms/BoardBody';

jest.mock('@/components/office/tasks/organisms/KanbanBoard', () => ({
  KanbanBoard: () => <div>kanban-content</div>,
}));
jest.mock('@/components/office/tasks/organisms/ListView', () => ({
  ListView: () => <div>list-content</div>,
}));
jest.mock('@/components/office/tasks/organisms/CalendarView', () => ({
  CalendarView: () => <div>calendar-content</div>,
}));
jest.mock('@/components/office/tasks/organisms/TimelineView', () => ({
  TimelineView: () => <div>timeline-content</div>,
}));

const baseProps = {
  search: '',
  searchRef: createRef<HTMLInputElement>() as RefObject<HTMLInputElement | null>,
  showArchive: false,
  setShowArchive: () => {},
  onViewChange: () => {},
};

describe('BoardBody', () => {
  it('shows a spinner while loading', () => {
    render(<BoardBody {...baseProps} isLoading boardId='b1' view='kanban' />);
    expect(
      screen.getByText((_, el) => el?.className === 'loading loading-spinner loading-lg'),
    ).toBeInTheDocument();
  });

  it('shows an empty message when no board is selected', () => {
    render(<BoardBody {...baseProps} isLoading={false} boardId={undefined} view='kanban' />);
    expect(screen.getByText('No projects yet. Create one from the sidebar.')).toBeInTheDocument();
  });

  it('renders the kanban view', () => {
    render(<BoardBody {...baseProps} isLoading={false} boardId='b1' view='kanban' />);
    expect(screen.getByText('kanban-content')).toBeInTheDocument();
  });

  it('renders the list view', () => {
    render(<BoardBody {...baseProps} isLoading={false} boardId='b1' view='list' />);
    expect(screen.getByText('list-content')).toBeInTheDocument();
  });

  it('renders the calendar view', () => {
    render(<BoardBody {...baseProps} isLoading={false} boardId='b1' view='calendar' />);
    expect(screen.getByText('calendar-content')).toBeInTheDocument();
  });

  it('renders the timeline view', () => {
    render(<BoardBody {...baseProps} isLoading={false} boardId='b1' view='timeline' />);
    expect(screen.getByText('timeline-content')).toBeInTheDocument();
  });
});
