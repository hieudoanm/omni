import { render, screen } from '@testing-library/react';
import StatusBar from '@/components/office/csv/molecules/StatusBar';

describe('StatusBar', () => {
  it('shows the active cell label and grid size', () => {
    render(
      <StatusBar
        activeLabel='B2'
        rangeLabel='B2'
        sheetName='Sheet 1'
        gridSize={{ rows: 10, cols: 5 }}
      />,
    );
    expect(screen.getByLabelText('Active cell')).toHaveTextContent('B2');
    expect(screen.getByLabelText('Grid size')).toHaveTextContent('10 rows x 5 columns');
    expect(screen.getByText('Sheet 1')).toBeInTheDocument();
  });

  it('shows the range label when a range is selected', () => {
    render(
      <StatusBar
        activeLabel='B2'
        rangeLabel='B2:C4'
        sheetName='Sheet 1'
        gridSize={{ rows: 10, cols: 5 }}
      />,
    );
    expect(screen.getByText('B2:C4')).toBeInTheDocument();
  });

  it('omits the range label when only one cell is selected', () => {
    render(
      <StatusBar
        activeLabel='B2'
        rangeLabel='B2'
        sheetName='Sheet 1'
        gridSize={{ rows: 10, cols: 5 }}
      />,
    );
    expect(screen.queryByText('B2:C4')).toBeNull();
  });
});
