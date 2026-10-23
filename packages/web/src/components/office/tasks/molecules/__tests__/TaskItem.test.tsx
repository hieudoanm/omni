import { fireEvent, render, screen } from '@testing-library/react';
import TaskItem from '@/components/office/tasks/molecules/TaskItem';
import type { Task } from '@/lib/office/tasks/types';

const task: Task = {
  id: 't1',
  userId: 'mem-1',
  text: 'Write tests',
  completed: false,
  createdAt: 1,
  updatedAt: 1,
};

describe('TaskItem', () => {
  it('renders the task text and an unchecked checkbox', () => {
    render(<TaskItem task={task} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('ticks the checkbox for completed tasks', () => {
    render(
      <TaskItem task={{ ...task, completed: true }} onToggle={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onToggle when the checkbox changes', () => {
    const onToggle = jest.fn();
    render(<TaskItem task={task} onToggle={onToggle} onDelete={() => {}} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('t1');
  });

  it('calls onDelete when the delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<TaskItem task={task} onToggle={() => {}} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onDelete).toHaveBeenCalledWith('t1');
  });
});
