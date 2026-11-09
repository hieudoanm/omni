import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Toolbar from '@/components/office/csv/molecules/Toolbar';

describe('Toolbar', () => {
  const baseProps = {
    canUndo: false,
    canRedo: false,
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    onNew: jest.fn(),
    onImport: jest.fn(),
    onExport: jest.fn(),
    onPrint: jest.fn(),
    onAddRow: jest.fn(),
    onAddColumn: jest.fn(),
    onDeleteRow: jest.fn(),
    onDeleteColumn: jest.fn(),
    onSort: jest.fn(),
    onToggleFilter: jest.fn(),
    filterActive: false,
    onToggleFind: jest.fn(),
    findOpen: false,
    onToggleComment: jest.fn(),
    canComment: true,
    freezeMode: 'none' as const,
    onSetFreeze: jest.fn(),
    theme: 'dark' as const,
    onToggleTheme: jest.fn(),
    onOpenShortcuts: jest.fn(),
    activeCellLabel: 'A1',
    activeFormat: 'general' as const,
    activeAlignment: 'left' as const,
    onFormatChange: jest.fn(),
    onAlignmentChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables undo and redo when history is empty', () => {
    render(<Toolbar {...baseProps} />);
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /redo/i })).toBeDisabled();
  });

  it('enables undo and redo when history is available', () => {
    render(<Toolbar {...baseProps} canUndo canRedo />);
    fireEvent.click(screen.getByRole('button', { name: /undo/i }));
    fireEvent.click(screen.getByRole('button', { name: /redo/i }));
    expect(baseProps.onUndo).toHaveBeenCalledTimes(1);
    expect(baseProps.onRedo).toHaveBeenCalledTimes(1);
  });

  it('triggers new, add row, and add column actions', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /new/i }));
    fireEvent.click(screen.getByRole('button', { name: /add row/i }));
    fireEvent.click(screen.getByRole('button', { name: /add column/i }));
    expect(baseProps.onNew).toHaveBeenCalledTimes(1);
    expect(baseProps.onAddRow).toHaveBeenCalledTimes(1);
    expect(baseProps.onAddColumn).toHaveBeenCalledTimes(1);
  });

  it('deletes rows and columns', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /delete row/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete column/i }));
    expect(baseProps.onDeleteRow).toHaveBeenCalledTimes(1);
    expect(baseProps.onDeleteColumn).toHaveBeenCalledTimes(1);
  });

  it('sorts by the active column in both directions', () => {
    render(<Toolbar {...baseProps} activeCellLabel='B3' />);
    fireEvent.click(screen.getByRole('button', { name: /a→z/i }));
    fireEvent.click(screen.getByRole('button', { name: /z→a/i }));
    expect(baseProps.onSort).toHaveBeenNthCalledWith(1, 'asc');
    expect(baseProps.onSort).toHaveBeenNthCalledWith(2, 'desc');
  });

  it('toggles filter and find', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));
    fireEvent.click(screen.getByRole('button', { name: /find/i }));
    expect(baseProps.onToggleFilter).toHaveBeenCalledTimes(1);
    expect(baseProps.onToggleFind).toHaveBeenCalledTimes(1);
  });

  it('marks active toggles as active', () => {
    const { rerender } = render(<Toolbar {...baseProps} filterActive findOpen />);
    expect(screen.getByRole('button', { name: /filter/i })).toHaveClass('btn-active');
    expect(screen.getByRole('button', { name: /find/i })).toHaveClass('btn-active');
    rerender(<Toolbar {...baseProps} />);
    expect(screen.getByRole('button', { name: /filter/i })).not.toHaveClass('btn-active');
  });

  it('disables the comment button when the active cell is not editable', () => {
    render(<Toolbar {...baseProps} canComment={false} />);
    expect(screen.getByRole('button', { name: /comment/i })).toBeDisabled();
  });

  it('exports the selected format', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.change(screen.getByLabelText('Export as'), {
      target: { value: 'xlsx' },
    });
    expect(baseProps.onExport).toHaveBeenCalledWith('xlsx');
  });

  it('ignores the placeholder export option', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.change(screen.getByLabelText('Export as'), {
      target: { value: '' },
    });
    expect(baseProps.onExport).not.toHaveBeenCalled();
  });

  it('sets the freeze mode from the select', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.change(screen.getByLabelText('Freeze panes'), {
      target: { value: 'both' },
    });
    expect(baseProps.onSetFreeze).toHaveBeenCalledWith('both');
  });

  it('applies a number format from the select', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.change(screen.getByLabelText('Number format'), {
      target: { value: 'currency' },
    });
    expect(baseProps.onFormatChange).toHaveBeenCalledWith('currency');
  });

  it('reflects the active number format', () => {
    render(<Toolbar {...baseProps} activeFormat='percent' />);
    expect(screen.getByLabelText('Number format')).toHaveValue('percent');
  });

  it('applies an alignment from the button group', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Align center' }));
    expect(baseProps.onAlignmentChange).toHaveBeenCalledWith('center');
  });

  it('marks the active alignment button as pressed', () => {
    render(<Toolbar {...baseProps} activeAlignment='right' />);
    expect(screen.getByRole('button', { name: 'Align right' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Align left' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('reflects the current freeze mode', () => {
    render(<Toolbar {...baseProps} freezeMode='row' />);
    expect(screen.getByLabelText('Freeze panes')).toHaveValue('row');
  });

  it('toggles the theme', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.click(screen.getByLabelText('Toggle theme'));
    expect(baseProps.onToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('opens the shortcuts modal', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.click(screen.getByLabelText('Keyboard shortcuts'));
    expect(baseProps.onOpenShortcuts).toHaveBeenCalledTimes(1);
  });

  it('prints', () => {
    render(<Toolbar {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    expect(baseProps.onPrint).toHaveBeenCalledTimes(1);
  });

  it('imports a file as text', async () => {
    render(<Toolbar {...baseProps} />);
    const input = screen.getByLabelText('Import CSV file');
    const file = new File(['a,b'], 'data.csv', { type: 'text/csv' });
    Object.defineProperty(file, 'text', {
      value: jest.fn().mockResolvedValue('a,b'),
    });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(baseProps.onImport).toHaveBeenCalledWith('a,b'));
  });
});
