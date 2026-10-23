import { act, fireEvent, render, screen } from '@testing-library/react';
import Grid from '@/components/office/csv/organisms/Grid';
import { createSheet } from '@/lib/office/csv/workbook';
import type { Selection } from '@/lib/office/csv/types';

describe('Grid', () => {
  const pointer = (type: string, init: MouseEventInit): MouseEvent =>
    new MouseEvent(type, { ...init, bubbles: true });

  const buildSheet = (rows = 2, cols = 3) => {
    const sheet = createSheet('Sheet 1', rows, cols);
    sheet.grid[0][0] = 'a';
    sheet.grid[1][1] = 'b';
    return sheet;
  };

  const baseProps = (overrides: Partial<React.ComponentProps<typeof Grid>> = {}) => {
    const sheet = buildSheet();
    return {
      sheet,
      displayGrid: sheet.grid.map((row) => [...row]),
      selection: { anchor: { row: 0, col: 0 }, focus: { row: 0, col: 0 } },
      editing: null,
      editingValue: '',
      filteredRows: null,
      findResults: [],
      currentMatch: null,
      commentDraft: null,
      onSelect: jest.fn(),
      onStartEdit: jest.fn(),
      onChange: jest.fn(),
      onCommit: jest.fn(),
      onKeyDown: jest.fn(),
      onResizeColumn: jest.fn(),
      onResizeRow: jest.fn(),
      onAutoFill: jest.fn(),
      ...overrides,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders column headers and row numbers', () => {
    render(<Grid {...baseProps()} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
  });

  it('renders an empty grid without headers', () => {
    const sheet = createSheet('Empty', 0, 0);
    render(<Grid {...baseProps({ sheet })} />);
    expect(screen.queryAllByRole('gridcell')).toHaveLength(0);
    expect(screen.queryByText('A')).toBeNull();
  });

  it('marks focused cells as selected', () => {
    const selection: Selection = {
      anchor: { row: 0, col: 0 },
      focus: { row: 1, col: 2 },
    };
    render(<Grid {...baseProps({ selection })} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells[0]).toHaveAttribute('aria-selected', 'true');
    expect(cells[cells.length - 1]).toHaveAttribute('aria-selected', 'true');
  });

  it('reports selection and edit starts', () => {
    const props = baseProps();
    render(<Grid {...props} />);
    const cells = screen.getAllByRole('gridcell');
    fireEvent.click(cells[2]);
    expect(props.onSelect).toHaveBeenCalledWith({ row: 0, col: 2 }, false);
    fireEvent.doubleClick(cells[2]);
    expect(props.onStartEdit).toHaveBeenCalledWith({ row: 0, col: 2 });
  });

  it('renders an editing input for the active cell', () => {
    const props = baseProps({
      editing: { row: 1, col: 1 },
      editingValue: 'editing',
    });
    render(<Grid {...props} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('editing');
    fireEvent.change(input, { target: { value: 'next' } });
    expect(props.onChange).toHaveBeenCalledWith({ row: 1, col: 1 }, 'next');
  });

  it('highlights find matches and the current match', () => {
    const props = baseProps({
      findResults: [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
      ],
      currentMatch: { row: 1, col: 1 },
    });
    render(<Grid {...props} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells[0].className).toContain('bg-warning/25');
    expect(cells[4].className).toContain('bg-warning/50');
  });

  it('outlines the comment draft cell', () => {
    render(<Grid {...baseProps({ commentDraft: { row: 0, col: 0 } })} />);
    expect(screen.getAllByRole('gridcell')[0].className).toContain('outline-accent');
  });

  it('renders only the filtered rows', () => {
    render(<Grid {...baseProps({ filteredRows: [1] })} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(3);
    expect(cells[1]).toHaveTextContent('b');
    expect(screen.queryByText('a')).toBeNull();
    expect(screen.getAllByRole('rowheader')).toHaveLength(1);
  });

  it('resizes a column by dragging its separator', () => {
    const props = baseProps();
    render(<Grid {...props} />);
    const handle = screen.getByLabelText('Resize column A');
    fireEvent(handle, pointer('pointerdown', { clientX: 100 }));
    window.dispatchEvent(pointer('pointermove', { clientX: 160 }));
    expect(props.onResizeColumn).toHaveBeenCalledWith(0, 188);
    window.dispatchEvent(pointer('pointerup', {}));
  });

  it('clamps column resize to the minimum width', () => {
    const props = baseProps();
    render(<Grid {...props} />);
    const handle = screen.getByLabelText('Resize column A');
    fireEvent(handle, pointer('pointerdown', { clientX: 100 }));
    window.dispatchEvent(pointer('pointermove', { clientX: 0 }));
    expect(props.onResizeColumn).toHaveBeenCalledWith(0, 40);
    window.dispatchEvent(pointer('pointerup', {}));
  });

  it('resizes a row by dragging its separator', () => {
    const props = baseProps();
    render(<Grid {...props} />);
    const handle = screen.getByLabelText('Resize row 1');
    fireEvent(handle, pointer('pointerdown', { clientY: 50 }));
    window.dispatchEvent(pointer('pointermove', { clientY: 90 }));
    expect(props.onResizeRow).toHaveBeenCalledWith(0, 68);
    window.dispatchEvent(pointer('pointerup', {}));
  });

  it('shows the computed display value for formula cells', () => {
    const sheet = buildSheet();
    sheet.grid[0][0] = '=1+1';
    const displayGrid = sheet.grid.map((row) => [...row]);
    displayGrid[0][0] = '2';
    render(<Grid {...baseProps({ sheet, displayGrid })} />);
    expect(screen.getAllByRole('gridcell')[0]).toHaveTextContent('2');
  });

  it('shows the raw value while editing a formula cell', () => {
    const sheet = buildSheet();
    sheet.grid[0][0] = '=1+1';
    const displayGrid = sheet.grid.map((row) => [...row]);
    displayGrid[0][0] = '2';
    render(
      <Grid
        {...baseProps({ sheet, displayGrid })}
        editing={{ row: 0, col: 0 }}
        editingValue='=1+1'
      />,
    );
    const input = screen.getByLabelText('Cell value') as HTMLInputElement;
    expect(input.value).toBe('=1+1');
  });

  it('renders the fill handle at the selection corner', () => {
    const selection: Selection = {
      anchor: { row: 0, col: 0 },
      focus: { row: 1, col: 1 },
    };
    render(<Grid {...baseProps({ selection })} />);
    const handle = screen.getByLabelText('Fill handle');
    expect(handle.closest('td')).toBe(screen.getAllByRole('gridcell')[4]);
  });

  it('hides the fill handle while editing', () => {
    render(<Grid {...baseProps({ editing: { row: 0, col: 0 } })} />);
    expect(screen.queryByLabelText('Fill handle')).toBeNull();
  });

  it('fills a range when dragging the fill handle', () => {
    const props = baseProps();
    render(<Grid {...props} />);
    const cells = screen.getAllByRole('gridcell');
    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => cells[5] as unknown as HTMLElement;
    try {
      fireEvent.pointerDown(screen.getByLabelText('Fill handle'), {
        button: 0,
      });
      act(() => {
        window.dispatchEvent(pointer('pointermove', { clientX: 0, clientY: 0 }));
      });
      expect(screen.getAllByRole('gridcell')[3].className).toContain('bg-primary/25');
      act(() => {
        window.dispatchEvent(pointer('pointerup', {}));
      });
    } finally {
      document.elementFromPoint = originalElementFromPoint;
    }
    expect(props.onAutoFill).toHaveBeenCalledWith(
      { top: 0, left: 0, bottom: 0, right: 0 },
      { top: 0, left: 0, bottom: 1, right: 2 },
    );
  });
});
