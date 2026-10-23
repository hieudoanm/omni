import { fireEvent, render, screen } from '@testing-library/react';
import TaskInput from '@/components/office/tasks/molecules/TaskInput';

describe('TaskInput', () => {
  it('adds a trimmed task and clears the field', () => {
    const onAdd = jest.fn();
    render(<TaskInput onAdd={onAdd} />);
    const input = screen.getByPlaceholderText('Add a task...');
    fireEvent.change(input, { target: { value: '  Buy milk  ' } });
    fireEvent.click(screen.getByText('Add'));
    expect(onAdd).toHaveBeenCalledWith('Buy milk');
    expect(input).toHaveValue('');
  });

  it('submits on Enter', () => {
    const onAdd = jest.fn();
    render(<TaskInput onAdd={onAdd} />);
    const input = screen.getByPlaceholderText('Add a task...');
    fireEvent.change(input, { target: { value: 'Refactor' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onAdd).toHaveBeenCalledWith('Refactor');
  });

  it('ignores whitespace-only input', () => {
    const onAdd = jest.fn();
    render(<TaskInput onAdd={onAdd} />);
    const input = screen.getByPlaceholderText('Add a task...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();
  });
});
