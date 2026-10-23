import { render, screen } from '@testing-library/react';
import { ThreeDayView } from '@/components/office/calendar/molecules/ThreeDayView';

describe('ThreeDayView', () => {
  it('renders time labels', () => {
    render(<ThreeDayView year={2024} month={0} day={15} />);
    expect(screen.getByText('12 AM')).toBeInTheDocument();
    expect(screen.getByText('11 PM')).toBeInTheDocument();
  });

  it('renders 3 day date headers', () => {
    render(<ThreeDayView year={2024} month={0} day={15} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
  });
});
