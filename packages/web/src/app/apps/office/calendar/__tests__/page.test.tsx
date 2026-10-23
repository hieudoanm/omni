import { render, screen } from '@testing-library/react';

jest.mock('@/components/office/calendar/organisms/CalendarApp', () => ({
  CalendarApp: () => <div data-testid='calendar-app'>CalendarApp</div>,
}));

import CalendarPage from '@/app/apps/office/calendar/page';

describe('CalendarPage', () => {
  it('renders CalendarApp', () => {
    render(<CalendarPage />);
    expect(screen.getByTestId('calendar-app')).toBeInTheDocument();
  });
});
