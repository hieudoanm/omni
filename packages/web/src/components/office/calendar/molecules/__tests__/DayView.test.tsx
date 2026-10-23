import { render, screen } from '@testing-library/react';
import { DayView } from '@/components/office/calendar/molecules/DayView';

describe('DayView', () => {
  it('renders all time blocks', () => {
    render(<DayView year={2024} month={0} day={15} />);
    expect(screen.getByText('Sleep')).toBeInTheDocument();
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Morning work')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Afternoon work')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    expect(screen.getByText('Relaxation')).toBeInTheDocument();
  });

  it('renders time ranges for each block', () => {
    render(<DayView year={2024} month={0} day={15} />);
    expect(screen.getByText('00–08')).toBeInTheDocument();
    expect(screen.getByText('08–09')).toBeInTheDocument();
    expect(screen.getByText('09–12')).toBeInTheDocument();
    expect(screen.getByText('21–24')).toBeInTheDocument();
  });

  it('renders duration for each block', () => {
    render(<DayView year={2024} month={0} day={15} />);
    expect(screen.getByText('8h')).toBeInTheDocument();
    expect(screen.getAllByText('1h')).toHaveLength(3);
    expect(screen.getAllByText('3h')).toHaveLength(2);
    expect(screen.getByText('5h')).toBeInTheDocument();
    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('renders time grid labels', () => {
    render(<DayView year={2024} month={0} day={15} />);
    expect(screen.getByText('12 AM')).toBeInTheDocument();
    expect(screen.getByText('11 PM')).toBeInTheDocument();
  });

  it('renders without day header', () => {
    render(<DayView year={2024} month={0} day={15} />);
    expect(screen.queryByText('Mon')).not.toBeInTheDocument();
  });
});
