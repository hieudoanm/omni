import { render, screen } from '@testing-library/react';
import { EventList } from '@/components/office/calendar/atoms/EventList';
import type { Event } from '@/data/office/calendar/events';

describe('EventList', () => {
  it('shows empty state when no events', () => {
    render(<EventList events={[]} />);
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('No events on this date.')).toBeInTheDocument();
  });

  it('renders event titles and fields', () => {
    const events: Event[] = [
      {
        year: 1,
        month: 1,
        date: 1,
        frequency: 'annual',
        type: 'holiday',
        country: 'International',
        field: 'Holiday',
        title: "New Year's Day",
      },
      {
        year: 1975,
        month: 1,
        date: 1,
        frequency: 'annual',
        type: 'birthday',
        country: 'Japan',
        field: 'Mangaka',
        title: 'Eiichiro Oda',
      },
    ];
    render(<EventList events={events} />);
    expect(screen.getByText("New Year's Day")).toBeInTheDocument();
    expect(screen.getByText('Holiday')).toBeInTheDocument();
    expect(screen.getByText('Eiichiro Oda')).toBeInTheDocument();
    expect(screen.getByText('Mangaka')).toBeInTheDocument();
  });
});
