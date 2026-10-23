import { render, screen } from '@testing-library/react';
import { LunarDate } from '@/components/office/calendar/atoms/LunarDate';

describe('LunarDate', () => {
  it('renders lunar date with date info', () => {
    render(
      <LunarDate
        chosenDate={new Date(2024, 0, 15)}
        lunarDay={25}
        lunarMonth={12}
        lunarYear={2023}
      />,
    );
    expect(screen.getByText('Lunar Date')).toBeInTheDocument();
    expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('25/12/2023')).toBeInTheDocument();
  });

  it('shows Unavailable when lunar data is null', () => {
    render(
      <LunarDate
        chosenDate={new Date(2024, 0, 15)}
        lunarDay={null}
        lunarMonth={null}
        lunarYear={null}
      />,
    );
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });
});
