import { render, screen, fireEvent } from '@testing-library/react';
import { MonthCalendar } from '@/components/office/calendar/molecules/MonthCalendar';

const defaultProps = {
  year: 2024,
  month: 0,
  chosenDate: new Date(2024, 0, 15),
  onDateSelect: jest.fn(),
  events: [],
};

describe('MonthCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders weekday headers', () => {
    render(<MonthCalendar {...defaultProps} />);
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('renders days of the month', () => {
    render(<MonthCalendar {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('31')).toBeInTheDocument();
  });

  it('highlights today', () => {
    const today = new Date();
    render(
      <MonthCalendar
        {...defaultProps}
        year={today.getFullYear()}
        month={today.getMonth()}
        chosenDate={today}
      />,
    );
    const todayEl = screen.getByText(today.getDate().toString());
    expect(todayEl.closest('button')).toHaveClass('bg-primary');
  });

  it('highlights chosen date', () => {
    render(<MonthCalendar {...defaultProps} />);
    const chosen = screen.getByText('15');
    expect(chosen.closest('button')).toHaveClass('bg-base-content/10');
  });

  it('calls onDateSelect when a day is clicked', () => {
    const onDateSelect = jest.fn();
    render(<MonthCalendar {...defaultProps} onDateSelect={onDateSelect} />);
    fireEvent.click(screen.getByText('10'));
    expect(onDateSelect).toHaveBeenCalledWith(new Date(2024, 0, 10));
  });

  it('shows event dots for dates with events', () => {
    const events = [
      {
        year: 0,
        month: 1,
        date: 1,
        frequency: 'annual' as const,
        type: 'holiday',
        country: '',
        field: '',
        title: "New Year's Day",
      },
    ];
    const { container } = render(<MonthCalendar {...defaultProps} events={events} />);
    const dots = container.querySelectorAll('.bg-primary.h-1.w-1');
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });

  it('renders correct number of cells for February leap year', () => {
    const { container } = render(<MonthCalendar {...defaultProps} year={2024} month={1} />);
    const cells = container.querySelectorAll('[class*="border-b"][class*="border-r"]');
    expect(cells.length).toBe(35);
  });

  it('renders correct number of cells for February non-leap year', () => {
    const { container } = render(<MonthCalendar {...defaultProps} year={2023} month={1} />);
    const cells = container.querySelectorAll('[class*="border-b"][class*="border-r"]');
    expect(cells.length).toBe(35);
  });
});
