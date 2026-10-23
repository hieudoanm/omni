import { render, screen } from '@testing-library/react';
import { YearlyView } from '@/components/office/calendar/molecules/YearlyView';

describe('YearlyView', () => {
  it('renders all 12 month labels', () => {
    render(<YearlyView year={2024} />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Dec')).toBeInTheDocument();
  });
});
