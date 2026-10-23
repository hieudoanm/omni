import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/office/keynotes/organisms/ToastProvider';

const Consumer: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();
  return (
    <div>
      <span data-testid='count'>{toasts.length}</span>
      {toasts.map((t) => (
        <span key={t.id} data-testid={`toast-${t.id}`}>
          {t.message} ({t.type})
        </span>
      ))}
      <button onClick={() => addToast('Hello')}>addInfo</button>
      <button onClick={() => addToast('Done', 'success')}>addSuccess</button>
      <button onClick={() => addToast('Oops', 'error')}>addError</button>
      <button
        onClick={() => {
          if (toasts.length > 0) removeToast(toasts[0].id);
        }}>
        removeFirst
      </button>
    </div>
  );
};

const ConsumerError: React.FC = () => {
  try {
    useToast();
    return <span>no error</span>;
  } catch (e: any) {
    return <span data-testid='error'>{e.message}</span>;
  }
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ToastProvider', () => {
  it('throws when useToast is used outside provider', () => {
    render(<ConsumerError />);
    expect(screen.getByTestId('error')).toHaveTextContent(
      'useToast must be used within ToastProvider',
    );
  });

  it('adds a toast with default info type', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    fireEvent.click(screen.getByText('addInfo'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    const toastEl = screen.getByText(/Hello/);
    expect(toastEl.textContent).toContain('info');
  });

  it('adds a toast with success type', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('addSuccess'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    const toastEl = screen.getByText(/Done/);
    expect(toastEl.textContent).toContain('success');
  });

  it('adds a toast with error type', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('addError'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    const toastEl = screen.getByText(/Oops/);
    expect(toastEl.textContent).toContain('error');
  });

  it('manually removes a toast', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('addInfo'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    fireEvent.click(screen.getByText('removeFirst'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('auto-removes toast after 3 seconds', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('addInfo'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('can add multiple toasts', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('addInfo'));
    fireEvent.click(screen.getByText('addSuccess'));
    fireEvent.click(screen.getByText('addError'));
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });

  it('auto-removes only the specific toast after timeout', () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('addInfo'));
    fireEvent.click(screen.getByText('addSuccess'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
