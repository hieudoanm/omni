import { fireEvent, render, screen } from '@testing-library/react';
import LabelFilters from '@/components/office/tasks/molecules/LabelFilters';
import type { Label } from '@/lib/office/tasks/types';

const labels: Label[] = [
  { id: 'l1', name: 'Bug', color: '#f00' },
  { id: 'l2', name: 'Feature', color: '#0f0' },
];

describe('LabelFilters', () => {
  it('renders all labels as buttons', () => {
    render(<LabelFilters labels={labels} activeLabel={null} onChange={() => {}} />);
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Feature')).toBeInTheDocument();
  });

  it('activates a label on click', () => {
    const onChange = jest.fn();
    render(<LabelFilters labels={labels} activeLabel={null} onChange={onChange} />);
    fireEvent.click(screen.getByText('Bug'));
    expect(onChange).toHaveBeenCalledWith('l1');
  });

  it('deactivates the active label on click', () => {
    const onChange = jest.fn();
    render(<LabelFilters labels={labels} activeLabel='l1' onChange={onChange} />);
    fireEvent.click(screen.getByText('Bug'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('shows a close icon on the active label', () => {
    render(<LabelFilters labels={labels} activeLabel='l2' onChange={() => {}} />);
    expect(screen.getByText('Feature').querySelector('svg')).toBeInTheDocument();
  });
});
