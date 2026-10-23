import { render, screen } from '@testing-library/react';

jest.mock('@/components/office/csv/organisms/Sheet', () => ({
  __esModule: true,
  Sheet: () => <div data-testid='csv-editor'>Editor</div>,
}));

import SheetPage from '@/app/apps/office/csv/page';

describe('SheetPage', () => {
  it('renders Editor', () => {
    render(<SheetPage />);
    expect(screen.getByTestId('csv-editor')).toBeInTheDocument();
  });
});
