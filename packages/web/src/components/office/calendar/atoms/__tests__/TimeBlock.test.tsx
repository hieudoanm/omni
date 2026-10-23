import { render, screen } from '@testing-library/react';
import { TimeBlock } from '@/components/office/calendar/atoms/TimeBlock';

const block = { label: 'Morning work', start: 9, end: 12 };

describe('TimeBlock', () => {
  it('renders label and time range', () => {
    render(<TimeBlock block={block} currentHour={10} isActive={false} />);
    expect(screen.getByText('Morning work')).toBeInTheDocument();
    expect(screen.getByText('09–12')).toBeInTheDocument();
  });

  it('renders duration', () => {
    render(<TimeBlock block={block} currentHour={10} isActive={false} />);
    expect(screen.getByText('3h')).toBeInTheDocument();
  });

  it('positions absolutely based on start hour', () => {
    const { container } = render(<TimeBlock block={block} currentHour={10} isActive={false} />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({
      position: 'absolute',
      top: '504px',
      height: '168px',
    });
  });

  it('shows progress bar when active', () => {
    const { container } = render(<TimeBlock block={block} currentHour={10.5} isActive={true} />);
    const progress = container.querySelector('[style*="width"]');
    expect(progress).toBeInTheDocument();
  });

  it('does not show progress bar when inactive', () => {
    const { container } = render(<TimeBlock block={block} currentHour={10} isActive={false} />);
    const progress = container.querySelector('[style*="width"]');
    expect(progress).not.toBeInTheDocument();
  });
});
