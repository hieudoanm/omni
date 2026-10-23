import { fireEvent, render, screen } from '@testing-library/react';
import { ViewSwitcher } from '@/components/office/tasks/organisms/ViewSwitcher';

describe('ViewSwitcher', () => {
  it('renders all view buttons with the active one pressed', () => {
    render(<ViewSwitcher value='list' onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Kanban' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Calendar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timeline' })).toBeInTheDocument();
  });

  it('calls onChange with the clicked view', () => {
    const onChange = jest.fn();
    render(<ViewSwitcher value='kanban' onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Calendar' }));
    expect(onChange).toHaveBeenCalledWith('calendar');
  });
});
