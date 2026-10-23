import { render, screen } from '@testing-library/react';
import LiteHomePage from '@/app/apps/office/lite/page';

describe('LiteHomePage', () => {
  it('renders the lite calendar tool card', () => {
    render(<LiteHomePage />);
    expect(screen.getByTestId('tool-card-litecalendar')).toBeInTheDocument();
  });

  it('links the calendar card to the lite calendar route', () => {
    render(<LiteHomePage />);
    expect(screen.getByTestId('tool-card-litecalendar')).toHaveAttribute(
      'href',
      '/apps/office/lite/calendar',
    );
  });

  it('renders the lite csv tool card', () => {
    render(<LiteHomePage />);
    expect(screen.getByTestId('tool-card-litecsv')).toBeInTheDocument();
  });

  it('links the csv card to the lite csv route', () => {
    render(<LiteHomePage />);
    expect(screen.getByTestId('tool-card-litecsv')).toHaveAttribute(
      'href',
      '/apps/office/lite/csv',
    );
  });

  it('renders the lite md tool card', () => {
    render(<LiteHomePage />);
    expect(screen.getByTestId('tool-card-litemd')).toBeInTheDocument();
  });

  it('links the md card to the lite md route', () => {
    render(<LiteHomePage />);
    expect(screen.getByTestId('tool-card-litemd')).toHaveAttribute('href', '/apps/office/lite/md');
  });
});
