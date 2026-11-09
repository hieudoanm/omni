import { fireEvent, render, screen } from '@testing-library/react';
import { DaysCountModal } from '@/components/office/calendar/organisms/DaysCountModal';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = jest.fn();
  HTMLDialogElement.prototype.close = jest.fn();
});

describe('DaysCountModal', () => {
  it('renders trigger button', () => {
    render(<DaysCountModal />);
    const buttons = screen.getAllByText('Days Count');
    expect(buttons.some((el) => el.tagName === 'BUTTON')).toBe(true);
  });

  it('opens dialog on trigger click', () => {
    render(<DaysCountModal />);
    const trigger = screen.getAllByText('Days Count').find((el) => el.tagName === 'BUTTON')!;
    fireEvent.click(trigger);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('calculates days between dates', () => {
    render(<DaysCountModal />);
    const trigger = screen.getAllByText('Days Count').find((el) => el.tagName === 'BUTTON')!;
    fireEvent.click(trigger);
    const inputs = screen.getAllByDisplayValue('') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(inputs[1], { target: { value: '2024-01-05' } });
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('4 d')).toBeInTheDocument();
  });

  it('closes on Close button click', () => {
    render(<DaysCountModal />);
    const trigger = screen.getAllByText('Days Count').find((el) => el.tagName === 'BUTTON')!;
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Close'));
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });
});
