import { fireEvent, render, screen } from '@testing-library/react';
import Cell from '@/components/office/csv/atoms/Cell';

describe('Cell', () => {
  const baseProps = {
    value: 'hello',
    isSelected: false,
    isFocus: false,
    isEditing: false,
    hasComment: false,
    commentText: '',
    width: 128,
    height: 28,
    cellRow: 0,
    cellCol: 0,
    onSelect: jest.fn(),
    onStartEdit: jest.fn(),
    onChange: jest.fn(),
    onCommit: jest.fn(),
    onKeyDown: jest.fn(),
    onPointerDown: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the value in a gridcell', () => {
    render(<Cell {...baseProps} />);
    expect(screen.getByRole('gridcell')).toHaveTextContent('hello');
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('exposes its position via data attributes', () => {
    render(<Cell {...baseProps} cellRow={3} cellCol={4} />);
    const cell = screen.getByRole('gridcell');
    expect(cell.dataset.row).toBe('3');
    expect(cell.dataset.col).toBe('4');
  });

  it('marks the cell as selected', () => {
    render(<Cell {...baseProps} isSelected />);
    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-selected', 'true');
  });

  it('selects on click and starts editing on double-click', () => {
    render(<Cell {...baseProps} />);
    const cell = screen.getByRole('gridcell');
    fireEvent.click(cell);
    expect(baseProps.onSelect).toHaveBeenCalledTimes(1);
    fireEvent.doubleClick(cell);
    expect(baseProps.onStartEdit).toHaveBeenCalledTimes(1);
  });

  it('reports pointer down', () => {
    render(<Cell {...baseProps} />);
    fireEvent.pointerDown(screen.getByRole('gridcell'), { button: 0 });
    expect(baseProps.onPointerDown).toHaveBeenCalledTimes(1);
  });

  it('renders an editing input with the value', () => {
    render(<Cell {...baseProps} isEditing />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('hello');
    fireEvent.change(input, { target: { value: 'edited' } });
    expect(baseProps.onChange).toHaveBeenCalledWith('edited');
  });

  it('commits on blur and reports keydown', () => {
    render(<Cell {...baseProps} isEditing />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(baseProps.onKeyDown).toHaveBeenCalledTimes(1);
    fireEvent.blur(input);
    expect(baseProps.onCommit).toHaveBeenCalledTimes(1);
  });

  it('shows a comment indicator and tooltip text', () => {
    render(<Cell {...baseProps} hasComment commentText='a note' />);
    const cell = screen.getByRole('gridcell');
    expect(cell.textContent).toContain('a note');
    expect(screen.getByText('a note')).toBeInTheDocument();
  });

  it('applies the alignment as a text alignment style', () => {
    render(<Cell {...baseProps} alignment='center' />);
    expect(screen.getByRole('gridcell').style.textAlign).toBe('center');
  });

  it('renders the fill handle and reports its pointer down', () => {
    const onFillHandlePointerDown = jest.fn();
    render(
      <Cell {...baseProps} showFillHandle onFillHandlePointerDown={onFillHandlePointerDown} />,
    );
    const handle = screen.getByLabelText('Fill handle');
    fireEvent.pointerDown(handle, { button: 0 });
    expect(onFillHandlePointerDown).toHaveBeenCalledTimes(1);
  });

  it('omits the fill handle by default', () => {
    render(<Cell {...baseProps} />);
    expect(screen.queryByLabelText('Fill handle')).toBeNull();
  });

  it('applies extra classes and styles', () => {
    render(<Cell {...baseProps} extraClassName='sticky z-20' extraStyle={{ left: 10 }} />);
    const cell = screen.getByRole('gridcell');
    expect(cell).toHaveClass('sticky', 'z-20');
    expect(cell.style.left).toBe('10px');
  });
});
