import { render, screen } from '@testing-library/react';
import { FiBox } from 'react-icons/fi';
import { AppsHub } from '../AppsHub';

const base = {
  title: 'Office',
  description: 'Test app',
  items: [
    {
      label: 'Calendar',
      description: 'A calendar productivity app',
      icon: FiBox,
      href: '/apps/office/calendar/',
    },
  ],
};

describe('AppsHub', () => {
  it('renders the title and description', () => {
    render(<AppsHub {...base} />);
    expect(screen.getByRole('heading', { name: 'Office' })).toBeInTheDocument();
    expect(screen.getByText('Test app')).toBeInTheDocument();
  });

  it('renders tool cards', () => {
    render(<AppsHub {...base} />);
    expect(screen.getByTestId('tool-card-calendar')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('A calendar productivity app')).toBeInTheDocument();
  });

  it('links each tool card to its route', () => {
    render(<AppsHub {...base} />);
    expect(screen.getByTestId('tool-card-calendar')).toHaveAttribute(
      'href',
      '/apps/office/calendar',
    );
  });
});
