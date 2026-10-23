import { fireEvent, render, screen } from '@testing-library/react';
import { LiteCalendar } from '@/components/office/calendar/organisms/LiteCalendar';

const heading = (): string => screen.getByTestId('calendar-heading').textContent ?? '';

const longMonth = (date: Date): string => date.toLocaleString('en-US', { month: 'long' });

const shiftMonth = (from: Date, delta: number): Date =>
  new Date(from.getFullYear(), from.getMonth() + delta, 1);

const headingFor = (date: Date): string => `${longMonth(date)} ${date.getFullYear()}`;

describe('LiteCalendar', () => {
  const today = new Date();

  it('renders the current month and year', () => {
    render(<LiteCalendar />);
    expect(heading()).toBe(headingFor(today));
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
  });

  it('navigates to the previous month', () => {
    render(<LiteCalendar />);
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(heading()).toBe(headingFor(shiftMonth(today, -1)));
  });

  it('navigates to the next month', () => {
    render(<LiteCalendar />);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(heading()).toBe(headingFor(shiftMonth(today, 1)));
  });

  it('returns to the current month via Today', () => {
    render(<LiteCalendar />);
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(heading()).toBe(headingFor(today));
  });

  it('jumps to January via the month select', () => {
    render(<LiteCalendar />);
    fireEvent.change(screen.getByLabelText('Month'), {
      target: { value: '0' },
    });
    expect(heading()).toBe(headingFor(new Date(today.getFullYear(), 0, 1)));
  });

  it('jumps to 2020 via the year select', () => {
    render(<LiteCalendar />);
    fireEvent.change(screen.getByLabelText('Year'), {
      target: { value: '2020' },
    });
    expect(heading()).toBe(`${longMonth(today)} 2020`);
  });
});
