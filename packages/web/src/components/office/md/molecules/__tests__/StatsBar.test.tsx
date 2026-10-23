import { render, screen } from '@testing-library/react';
import { StatsBar } from '@/components/office/md/molecules/StatsBar';

describe('StatsBar', () => {
  it('shows computed stats and note counts', () => {
    render(<StatsBar content='# Hi\n\nTwo words' noteCount={3} linkCount={2} danglingCount={1} />);
    expect(screen.getByText('words')).toBeInTheDocument();
    expect(screen.getByText('notes')).toBeInTheDocument();
    expect(screen.getByText(/dangling link/)).toBeInTheDocument();
  });

  it('omits the dangling warning when there are none', () => {
    render(<StatsBar content='' noteCount={1} linkCount={0} danglingCount={0} />);
    expect(screen.queryByText(/dangling/)).not.toBeInTheDocument();
  });
});
