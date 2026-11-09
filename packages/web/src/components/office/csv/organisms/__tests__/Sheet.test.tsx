jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sheet } from '@/components/office/csv/organisms/Sheet';
import { saveAs } from 'file-saver';

const grid = (): HTMLElement[] => screen.getAllByRole('gridcell');
const cellAt = (row: number, col: number): HTMLElement => grid()[row * 5 + col];
const activeLabel = (): HTMLElement => screen.getByLabelText('Active cell');
const focusGrid = (): void => {
  screen.getByLabelText('CSV spreadsheet').focus();
};

const typeCell = async (
  user: ReturnType<typeof userEvent.setup>,
  row: number,
  col: number,
  text: string,
): Promise<void> => {
  await user.dblClick(cellAt(row, col));
  await user.type(screen.getByRole('textbox'), text);
  await user.keyboard('{Enter}');
};

describe('Sheet', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders the grid with default dimensions and status', () => {
    render(<Sheet />);
    expect(screen.getByLabelText('CSV spreadsheet')).toBeInTheDocument();
    expect(screen.getByLabelText('Grid size')).toHaveTextContent('10 rows x 5 columns');
    expect(screen.getByRole('tab', { name: 'Sheet 1' })).toBeInTheDocument();
    expect(activeLabel()).toHaveTextContent('A1');
    expect(cellAt(0, 0).className).not.toContain('sticky');
  });

  it('edits a cell and commits on Enter, moving focus down', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, 'hello');
    expect(cellAt(0, 0)).toHaveTextContent('hello');
    expect(activeLabel()).toHaveTextContent('A2');
  });

  it('starts editing with a typed printable character and cancels on Escape', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    focusGrid();
    await user.keyboard('x');
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('x');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(cellAt(0, 0)).toHaveTextContent('');
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    focusGrid();
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowDown}');
    expect(activeLabel()).toHaveTextContent('B2');
  });

  it('moves right on Tab', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    focusGrid();
    await user.keyboard('{Tab}');
    expect(activeLabel()).toHaveTextContent('B1');
  });

  it('extends the selection with Shift and arrows', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    focusGrid();
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(screen.getByText('A1:B1')).toBeInTheDocument();
  });

  it('clears the active cell with Backspace', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, 'abc');
    await user.click(cellAt(0, 0));
    await user.keyboard('{Backspace}');
    expect(cellAt(0, 0)).toHaveTextContent('');
  });

  it('copies the selection to the clipboard', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, 'a');
    await user.click(cellAt(0, 0));
    const clipboardData = { setData: jest.fn(), getData: jest.fn() };
    fireEvent.copy(screen.getByLabelText('CSV spreadsheet'), { clipboardData });
    expect(clipboardData.setData).toHaveBeenCalledWith('text/plain', 'a');
  });

  it('cuts the selection and clears the cells', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, 'a');
    await user.click(cellAt(0, 0));
    const clipboardData = { setData: jest.fn(), getData: jest.fn() };
    fireEvent.cut(screen.getByLabelText('CSV spreadsheet'), { clipboardData });
    expect(clipboardData.setData).toHaveBeenCalledWith('text/plain', 'a');
    expect(cellAt(0, 0)).toHaveTextContent('');
  });

  it('pastes TSV data starting at the selection', () => {
    render(<Sheet />);
    const clipboardData = { getData: () => '1\t2\n3\t4', setData: jest.fn() };
    fireEvent.paste(screen.getByLabelText('CSV spreadsheet'), {
      clipboardData,
    });
    expect(cellAt(0, 0)).toHaveTextContent('1');
    expect(cellAt(0, 1)).toHaveTextContent('2');
    expect(cellAt(1, 0)).toHaveTextContent('3');
    expect(cellAt(1, 1)).toHaveTextContent('4');
  });

  it('adds, switches, renames and deletes sheets', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await user.click(screen.getByLabelText('Add sheet'));
    await user.click(screen.getByRole('tab', { name: /Sheet 2/ }));
    expect(activeLabel()).toHaveTextContent('A1');
    await user.dblClick(screen.getByRole('tab', { name: /Sheet 2/ }));
    const nameInput = screen.getByLabelText('Sheet name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Data');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('tab', { name: /Data/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete sheet Data' }));
    expect(screen.queryByRole('tab', { name: /Data/ })).toBeNull();
  });

  it('sorts the active column ascending', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, 'b');
    await typeCell(user, 1, 0, 'a');
    await typeCell(user, 2, 0, 'c');
    await user.click(screen.getByRole('button', { name: /a→z/i }));
    expect(cellAt(0, 0)).toHaveTextContent('a');
    expect(cellAt(1, 0)).toHaveTextContent('b');
    expect(cellAt(2, 0)).toHaveTextContent('c');
  });

  it('filters rows by text in a column', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, 'a');
    await typeCell(user, 1, 0, 'b');
    await user.click(screen.getByRole('button', { name: /filter/i }));
    await user.type(screen.getByLabelText('Filter text'), 'b');
    expect(screen.getAllByRole('gridcell')).toHaveLength(5);
    expect(screen.getAllByRole('rowheader')).toHaveLength(1);
    expect(screen.getByText('b')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Close filter'));
    expect(screen.getAllByRole('gridcell')).toHaveLength(50);
  });

  it('finds and replaces values', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, 'hello');
    focusGrid();
    await user.keyboard('{Control>}f{/Control}');
    await user.type(screen.getByLabelText('Find text'), 'hello');
    expect(screen.getByLabelText('Match count')).toHaveTextContent('1/1');
    await user.type(screen.getByLabelText('Replace text'), 'bye');
    await user.click(screen.getByRole('button', { name: 'Replace' }));
    expect(cellAt(0, 0)).toHaveTextContent('bye');
    expect(screen.getByLabelText('Match count')).toHaveTextContent('no matches');
  });

  it('finds the next match with the toolbar button', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, 'x');
    await typeCell(user, 1, 1, 'x');
    await user.click(screen.getByRole('button', { name: /find/i }));
    await user.type(screen.getByLabelText('Find text'), 'x');
    expect(screen.getByLabelText('Match count')).toHaveTextContent('1/2');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByLabelText('Match count')).toHaveTextContent('2/2');
  });

  it('adds and deletes a cell comment', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await user.click(screen.getByRole('button', { name: /comment/i }));
    await user.type(screen.getByLabelText('Comment text'), 'note');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('note')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /comment/i }));
    expect(screen.getByLabelText('Comment text')).toHaveValue('note');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.queryByText('note')).toBeNull();
  });

  it('freezes the top row', () => {
    render(<Sheet />);
    expect(cellAt(0, 0).className).not.toContain('sticky');
    fireEvent.change(screen.getByLabelText('Freeze panes'), {
      target: { value: 'row' },
    });
    expect(cellAt(0, 0).className).toContain('sticky');
    expect(cellAt(1, 0).className).not.toContain('sticky');
  });

  it('toggles the theme', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    expect(document.documentElement.dataset.theme).toBe('office-light');
    await user.click(screen.getByLabelText('Toggle theme'));
    expect(document.documentElement.dataset.theme).toBe('office-dark');
    await user.click(screen.getByLabelText('Toggle theme'));
    expect(document.documentElement.dataset.theme).toBe('office-light');
  });

  it('exports the active sheet as CSV', () => {
    render(<Sheet />);
    fireEvent.change(screen.getByLabelText('Export as'), {
      target: { value: 'csv' },
    });
    expect(jest.mocked(saveAs)).toHaveBeenCalledTimes(1);
    const [, filename] = jest.mocked(saveAs).mock.calls[0];
    expect(filename).toBe('Sheet_1.csv');
  });

  it('opens and closes the shortcuts panel with Ctrl+K', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    focusGrid();
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog', { name: /keyboard shortcuts/i })).toBeInTheDocument();
    await user.click(screen.getByLabelText('Close shortcuts'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('undoes and redoes edits', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, 'x');
    await user.click(screen.getByRole('button', { name: /undo/i }));
    expect(cellAt(0, 0)).toHaveTextContent('');
    await user.click(screen.getByRole('button', { name: /redo/i }));
    expect(cellAt(0, 0)).toHaveTextContent('x');
  });

  it('adds rows and columns from the toolbar', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await user.click(screen.getByRole('button', { name: /add row/i }));
    expect(screen.getByLabelText('Grid size')).toHaveTextContent('11 rows x 5 columns');
    await user.click(screen.getByRole('button', { name: /add column/i }));
    expect(screen.getByLabelText('Grid size')).toHaveTextContent('11 rows x 6 columns');
  });

  it('starts a new workbook from the toolbar', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, 'x');
    await user.click(screen.getByRole('button', { name: /new/i }));
    expect(activeLabel()).toHaveTextContent('A1');
    expect(cellAt(0, 0)).toHaveTextContent('');
    expect(screen.getByLabelText('Grid size')).toHaveTextContent('10 rows x 5 columns');
  });

  it('evaluates formulas and shows the computed result', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, '5');
    await typeCell(user, 1, 0, '10');
    await typeCell(user, 2, 0, '=SUM(A1:A2)');
    expect(cellAt(2, 0)).toHaveTextContent('15');
  });

  it('shows the raw formula text while editing a formula cell', async () => {
    const user = userEvent.setup();
    render(<Sheet />);
    await typeCell(user, 0, 0, '=1+1');
    expect(cellAt(0, 0)).toHaveTextContent('2');
    await user.dblClick(cellAt(0, 0));
    expect(screen.getByRole('textbox')).toHaveValue('=1+1');
  });
});
