import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarApp } from '@/components/office/calendar/organisms/CalendarApp';

const openDropdown = () => {
  const trigger = screen.getAllByText('Month').find((el) => el.getAttribute('role') === 'button');
  if (trigger) fireEvent.click(trigger);
};

const switchTo = (label: string) => {
  openDropdown();
  const items = screen.getAllByText(label);
  const menuItem = items.find((el) => el.tagName === 'A');
  if (menuItem) fireEvent.click(menuItem);
};

describe('CalendarApp', () => {
  it('renders with Month view by default', () => {
    render(<CalendarApp />);
    expect(screen.getByTestId('nav-today')).toBeInTheDocument();
  });

  it('renders current month and year in header', () => {
    render(<CalendarApp />);
    const now = new Date();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    expect(
      screen.getByRole('heading', {
        name: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      }),
    ).toBeInTheDocument();
  });

  it('navigates to previous month', () => {
    render(<CalendarApp />);
    fireEvent.click(screen.getByText('‹'));
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    expect(
      screen.getByRole('heading', {
        name: `${monthNames[prevMonth]} ${prevYear}`,
      }),
    ).toBeInTheDocument();
  });

  it('navigates to next month', () => {
    render(<CalendarApp />);
    fireEvent.click(screen.getByText('›'));
    const now = new Date();
    const nextMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
    const nextYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    expect(
      screen.getByRole('heading', {
        name: `${monthNames[nextMonth]} ${nextYear}`,
      }),
    ).toBeInTheDocument();
  });

  it('resets to today when Today button is clicked', () => {
    render(<CalendarApp />);
    fireEvent.click(screen.getByText('›'));
    fireEvent.click(screen.getByText('›'));
    fireEvent.click(screen.getByTestId('nav-today'));
    const now = new Date();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    expect(
      screen.getByRole('heading', {
        name: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      }),
    ).toBeInTheDocument();
  });

  it('switches to Week view', () => {
    render(<CalendarApp />);
    switchTo('Week');
    expect(screen.getAllByText('Week').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to Day view', () => {
    render(<CalendarApp />);
    switchTo('Day');
    const now = new Date();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    expect(
      screen.getByRole('heading', {
        name: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      }),
    ).toBeInTheDocument();
  });

  it('switches to 3 Days view', () => {
    render(<CalendarApp />);
    switchTo('3 Days');
    const now = new Date();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    expect(
      screen.getByRole('heading', {
        name: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
      }),
    ).toBeInTheDocument();
  });

  it('switches to Quarter view', () => {
    render(<CalendarApp />);
    switchTo('Quarter');
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    expect(
      screen.getByRole('heading', { name: `Q${quarter} ${now.getFullYear()}` }),
    ).toBeInTheDocument();
  });

  it('switches to Yearly view', () => {
    render(<CalendarApp />);
    switchTo('Year');
    const now = new Date();
    expect(screen.getByRole('heading', { name: now.getFullYear().toString() })).toBeInTheDocument();
  });

  it('navigates week view forward and backward', () => {
    render(<CalendarApp />);
    switchTo('Week');
    const initial = screen.getByRole('heading').textContent;
    fireEvent.click(screen.getByText('›'));
    const next = screen.getByRole('heading').textContent;
    expect(next).not.toBe(initial);
    fireEvent.click(screen.getByText('‹'));
    const back = screen.getByRole('heading').textContent;
    expect(back).toBe(initial);
  });

  it('navigates year view forward and backward', () => {
    render(<CalendarApp />);
    switchTo('Year');
    const now = new Date();
    fireEvent.click(screen.getByText('›'));
    expect(
      screen.getByRole('heading', { name: (now.getFullYear() + 1).toString() }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('‹'));
    expect(screen.getByRole('heading', { name: now.getFullYear().toString() })).toBeInTheDocument();
  });

  it('navigates Quarter view forward and backward', () => {
    render(<CalendarApp />);
    switchTo('Quarter');
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const currentYear = now.getFullYear();
    fireEvent.click(screen.getByText('›'));
    const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
    const nextYear = currentQuarter === 4 ? currentYear + 1 : currentYear;
    expect(
      screen.getByRole('heading', { name: `Q${nextQuarter} ${nextYear}` }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('‹'));
    expect(
      screen.getByRole('heading', { name: `Q${currentQuarter} ${currentYear}` }),
    ).toBeInTheDocument();
  });

  it('navigates Day view forward and backward', () => {
    render(<CalendarApp />);
    switchTo('Day');
    const initial = screen.getByRole('heading').textContent;
    fireEvent.click(screen.getByText('›'));
    const next = screen.getByRole('heading').textContent;
    expect(next).not.toBe(initial);
    fireEvent.click(screen.getByText('‹'));
    const back = screen.getByRole('heading').textContent;
    expect(back).toBe(initial);
  });

  it('navigates 3 Days view forward and backward', () => {
    render(<CalendarApp />);
    switchTo('3 Days');
    const initial = screen.getByRole('heading').textContent;
    fireEvent.click(screen.getByText('›'));
    const next = screen.getByRole('heading').textContent;
    expect(next).not.toBe(initial);
    fireEvent.click(screen.getByText('‹'));
    const back = screen.getByRole('heading').textContent;
    expect(back).toBe(initial);
  });

  it('selects month via dropdown', () => {
    render(<CalendarApp />);
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '5' } });
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const now = new Date();
    expect(
      screen.getByRole('heading', {
        name: `${monthNames[5]} ${now.getFullYear()}`,
      }),
    ).toBeInTheDocument();
  });

  it('selects year via dropdown', () => {
    render(<CalendarApp />);
    const selects = screen.getAllByRole('combobox');
    const yearSelect = selects[selects.length - 1];
    fireEvent.change(yearSelect, { target: { value: 2020 } });
    expect(screen.getByRole('heading', { name: /2020/ })).toBeInTheDocument();
    fireEvent.change(yearSelect, { target: { value: 2025 } });
    expect(screen.getByRole('heading', { name: /2025/ })).toBeInTheDocument();
  });

  it('switches to Half view', () => {
    render(<CalendarApp />);
    switchTo('Half');
    const now = new Date();
    const half = now.getMonth() < 6 ? 1 : 2;
    expect(
      screen.getByRole('heading', { name: `H${half} ${now.getFullYear()}` }),
    ).toBeInTheDocument();
  });

  it('navigates Half view forward and backward', () => {
    render(<CalendarApp />);
    switchTo('Half');
    const now = new Date();
    const currentHalf = now.getMonth() < 6 ? 1 : 2;
    const currentYear = now.getFullYear();
    fireEvent.click(screen.getByText('›'));
    const nextHalf = currentHalf === 2 ? 1 : 2;
    const nextYear = currentHalf === 2 ? currentYear + 1 : currentYear;
    expect(screen.getByRole('heading', { name: `H${nextHalf} ${nextYear}` })).toBeInTheDocument();
    fireEvent.click(screen.getByText('‹'));
    expect(
      screen.getByRole('heading', { name: `H${currentHalf} ${currentYear}` }),
    ).toBeInTheDocument();
  });

  it('navigates week to Today from far away', () => {
    render(<CalendarApp />);
    switchTo('Week');
    fireEvent.click(screen.getByText('›'));
    fireEvent.click(screen.getByText('›'));
    fireEvent.click(screen.getByText('›'));
    fireEvent.click(screen.getByTestId('nav-today'));
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
