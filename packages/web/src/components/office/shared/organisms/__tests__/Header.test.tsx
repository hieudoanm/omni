import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('Header', () => {
  it('renders the app name', () => {
    render(<Header />);
    expect(screen.getByText('Office')).toBeInTheDocument();
  });

  it('links home from the logo', () => {
    render(<Header />);
    expect(screen.getByText('Office').closest('a')).toHaveAttribute('href', '/apps/office');
  });

  it('renders theme toggle button', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('sets default data-theme to dark', () => {
    render(<Header />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('office-dark');
  });

  it('toggles theme on click', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('office-light');
  });

  it('toggles back to dark theme', () => {
    render(<Header />);
    const toggle = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(toggle);
    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('office-dark');
  });

  it('persists theme to localStorage', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));
    expect(localStorage.getItem('office-theme')).toBe('office-light');
  });

  it('restores the saved theme from localStorage', () => {
    localStorage.setItem('office-theme', 'office-dark');
    render(<Header />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('office-dark');
  });
});
