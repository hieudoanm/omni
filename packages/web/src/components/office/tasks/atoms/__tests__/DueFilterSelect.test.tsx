import { fireEvent, render, screen } from '@testing-library/react';
import DueFilterSelect from '@/components/office/tasks/atoms/DueFilterSelect';

describe('DueFilterSelect', () => {
  it('renders all due options with the current value selected', () => {
    render(<DueFilterSelect value='today' onChange={() => {}} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('today');
    expect((select as HTMLSelectElement).options.length).toBe(5);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('calls onChange with the newly selected value', () => {
    const onChange = jest.fn();
    render(<DueFilterSelect value='all' onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'overdue' },
    });
    expect(onChange).toHaveBeenCalledWith('overdue');
  });
});
