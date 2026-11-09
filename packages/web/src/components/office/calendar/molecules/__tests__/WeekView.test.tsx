import { render, screen } from '@testing-library/react';
import { WeekView } from '@/components/office/calendar/molecules/WeekView';

describe('WeekView', () => {
  it('renders 7 day columns', () => {
    const weekStart = new Date(2024, 0, 14);
    render(<WeekView year={2024} weekStart={weekStart} />);
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('renders time labels', () => {
    const weekStart = new Date(2024, 0, 14);
    render(<WeekView year={2024} weekStart={weekStart} />);
    expect(screen.getByText('12 AM')).toBeInTheDocument();
  });
});
