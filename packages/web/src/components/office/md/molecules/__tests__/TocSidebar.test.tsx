import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TocSidebar } from '@/components/office/md/molecules/TocSidebar';

describe('TocSidebar', () => {
  it('lists headings and scrolls to a heading on click', async () => {
    const user = userEvent.setup();
    const scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    const heading = document.createElement('h2');
    heading.id = 'intro';
    document.body.appendChild(heading);

    render(
      <TocSidebar
        items={[
          { id: 'intro', text: 'Intro', level: 1 },
          { id: 'deep', text: 'Deep', level: 3 },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Intro' }));
    expect(scrollIntoView).toHaveBeenCalled();
    heading.remove();
  });
});
