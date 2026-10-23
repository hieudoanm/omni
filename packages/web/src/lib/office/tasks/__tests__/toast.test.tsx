import { act, fireEvent, render, screen } from '@testing-library/react';
import { FC } from 'react';
import { ToastProvider, useToast } from '@/lib/office/tasks/toast';

const Probe: FC = () => {
  const { addToast } = useToast();
  return (
    <div>
      <button onClick={() => addToast('Saved', 'success')}>success</button>
      <button onClick={() => addToast('Failed', 'error')}>error</button>
      <button onClick={() => addToast('Info')}>info</button>
    </div>
  );
};

describe('ToastProvider', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <div>child</div>
      </ToastProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('adds a default info toast', () => {
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('info'));
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('adds success and error toasts with type-specific styling', () => {
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('success'));
    fireEvent.click(screen.getByText('error'));
    expect(screen.getByText('Saved').closest('.alert')).toHaveClass('alert-success');
    expect(screen.getByText('Failed').closest('.alert')).toHaveClass('alert-error');
  });

  it('auto-removes toasts after 3000ms', () => {
    jest.useFakeTimers();
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('info'));
    expect(screen.getByText('Info')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.queryByText('Info')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it('removes a toast straight away when the timer fires early', () => {
    jest.useFakeTimers();
    render(
      <ToastProvider>
        <Probe />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('info'));
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Info')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.queryByText('Info')).not.toBeInTheDocument();
    jest.useRealTimers();
  });
});

describe('useToast', () => {
  it('throws when used outside a provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const ErrorProbe: FC = () => {
      useToast();
      return null;
    };
    expect(() => render(<ErrorProbe />)).toThrow('useToast must be used within ToastProvider');
    spy.mockRestore();
  });
});
