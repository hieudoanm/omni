import { fireEvent, render, screen } from '@testing-library/react';
import { CountdownModal } from '@/components/office/calendar/organisms/CountdownModal';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = jest.fn();
  HTMLDialogElement.prototype.close = jest.fn();
});

describe('CountdownModal', () => {
  it('renders trigger button', () => {
    render(<CountdownModal />);
    const buttons = screen.getAllByText('Countdown');
    expect(buttons.some((el) => el.tagName === 'BUTTON')).toBe(true);
  });

  it('opens dialog on trigger click', () => {
    render(<CountdownModal />);
    const trigger = screen.getAllByText('Countdown').find((el) => el.tagName === 'BUTTON')!;
    fireEvent.click(trigger);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('shows default title and units', () => {
    render(<CountdownModal />);
    const trigger = screen.getAllByText('Countdown').find((el) => el.tagName === 'BUTTON')!;
    fireEvent.click(trigger);
    expect(screen.getByText('My Countdown')).toBeInTheDocument();
    expect(screen.getByText('yrs')).toBeInTheDocument();
    expect(screen.getByText('days')).toBeInTheDocument();
    expect(screen.getByText('hrs')).toBeInTheDocument();
    expect(screen.getByText('min')).toBeInTheDocument();
    expect(screen.getByText('sec')).toBeInTheDocument();
  });

  it('toggles edit mode', () => {
    render(<CountdownModal />);
    const trigger = screen.getAllByText('Countdown').find((el) => el.tagName === 'BUTTON')!;
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByDisplayValue('My Countdown')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('closes on Close button click', () => {
    render(<CountdownModal />);
    const trigger = screen.getAllByText('Countdown').find((el) => el.tagName === 'BUTTON')!;
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Close'));
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });
});
