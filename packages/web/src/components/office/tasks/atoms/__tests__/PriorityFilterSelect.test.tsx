import { fireEvent, render, screen } from '@testing-library/react';
import PriorityFilterSelect from '@/components/office/tasks/atoms/PriorityFilterSelect';

describe('PriorityFilterSelect', () => {
  it('renders all priority options with the current value selected', () => {
    render(<PriorityFilterSelect value='high' onChange={() => {}} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('high');
    expect((select as HTMLSelectElement).options.length).toBe(5);
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('calls onChange with the newly selected value', () => {
    const onChange = jest.fn();
    render(<PriorityFilterSelect value='all' onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'low' },
    });
    expect(onChange).toHaveBeenCalledWith('low');
  });
});
