import { render, screen } from '@testing-library/react';
import { TaskEmptyState } from '@/components/office/tasks/molecules/TaskEmptyState';

describe('TaskEmptyState', () => {
  it('renders default copy', () => {
    render(<TaskEmptyState />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first task above to get started.')).toBeInTheDocument();
  });

  it('renders custom copy', () => {
    render(<TaskEmptyState title='Empty' description='Nothing here' />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});
