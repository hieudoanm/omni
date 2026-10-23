jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

import { LiteSheet } from '@/components/office/csv/organisms/LiteSheet';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { saveAs } from 'file-saver';

const grid = (): HTMLElement[] => screen.getAllByRole('gridcell');
const cellAt = (row: number, col: number): HTMLElement => grid()[row * 5 + col];
const rowCount = (): number => screen.getAllByRole('row').length - 1;
const colCount = (): number => screen.getAllByRole('columnheader').length;

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

describe('LiteSheet', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders the grid with the lite toolbar', () => {
    render(<LiteSheet />);
    expect(screen.getByLabelText('CSV spreadsheet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete row/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });

  it('edits a cell and commits on Enter', async () => {
    const user = userEvent.setup();
    render(<LiteSheet />);
    await typeCell(user, 0, 0, 'hello');
    expect(cellAt(0, 0)).toHaveTextContent('hello');
  });

  it('adds and deletes rows', async () => {
    const user = userEvent.setup();
    render(<LiteSheet />);
    const initial = rowCount();
    await user.click(screen.getByRole('button', { name: /add row/i }));
    expect(rowCount()).toBe(initial + 1);
    await user.click(screen.getByRole('button', { name: /delete row/i }));
    expect(rowCount()).toBe(initial);
  });

  it('undoes and redoes an edit', async () => {
    const user = userEvent.setup();
    render(<LiteSheet />);
    await typeCell(user, 0, 0, 'hello');
    await user.click(screen.getByRole('button', { name: /undo/i }));
    expect(cellAt(0, 0)).toHaveTextContent('');
    await user.click(screen.getByRole('button', { name: /redo/i }));
    expect(cellAt(0, 0)).toHaveTextContent('hello');
  });

  it('exports the active sheet as CSV', async () => {
    const user = userEvent.setup();
    render(<LiteSheet />);
    await user.click(screen.getByRole('button', { name: /export csv/i }));
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'Sheet_1.csv');
  });

  it('adds and deletes columns', async () => {
    const user = userEvent.setup();
    render(<LiteSheet />);
    const initial = colCount();
    await user.click(screen.getByRole('button', { name: /add column/i }));
    expect(colCount()).toBe(initial + 1);
    await user.click(screen.getByRole('button', { name: /delete column/i }));
    expect(colCount()).toBe(initial);
  });
});
