import { render, screen } from '@testing-library/react';
import { TimeGrid } from '@/components/office/calendar/atoms/TimeGrid';

describe('TimeGrid', () => {
  it('renders time labels', () => {
    const dates = [new Date(2024, 0, 15)];
    render(<TimeGrid dates={dates} />);
    expect(screen.getByText('12 AM')).toBeInTheDocument();
    expect(screen.getByText('12 PM')).toBeInTheDocument();
  });

  it('renders day headers when showDayHeader is true', () => {
    const dates = [new Date(2024, 0, 15)];
    render(<TimeGrid dates={dates} showDayHeader={true} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('hides day headers when showDayHeader is false', () => {
    const dates = [new Date(2024, 0, 15)];
    render(<TimeGrid dates={dates} showDayHeader={false} />);
    expect(screen.queryByText('Mon')).not.toBeInTheDocument();
  });

  it('renders multiple date columns', () => {
    const dates = [new Date(2024, 0, 15), new Date(2024, 0, 16)];
    render(<TimeGrid dates={dates} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
  });
});
