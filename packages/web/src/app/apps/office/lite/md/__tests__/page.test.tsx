import { render, screen } from '@testing-library/react';

jest.mock('@/components/office/md/organisms/LiteMarkdownApp', () => ({
  __esModule: true,
  LiteMarkdownApp: () => <div data-testid='lite-markdown'>LiteMarkdown</div>,
}));

import LiteMarkdownPage from '@/app/apps/office/lite/md/page';

describe('LiteMarkdownPage', () => {
  it('renders LiteMarkdownPage', () => {
    render(<LiteMarkdownPage />);
    expect(screen.getByTestId('lite-markdown')).toBeInTheDocument();
  });
});
