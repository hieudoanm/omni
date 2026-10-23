import { fireEvent, render, screen } from '@testing-library/react';
import { ConvertToolbar } from '@/components/office/md/molecules/ConvertToolbar';

describe('ConvertToolbar', () => {
  it('renders case buttons and convert buttons', () => {
    render(<ConvertToolbar convertKind={null} onConvertChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Case UPPER' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Convert to Braille' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Convert to Morse' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Convert to Leet' })).toBeInTheDocument();
  });

  it('calls onConvertChange with case kind', () => {
    const onChange = jest.fn();
    render(<ConvertToolbar convertKind={null} onConvertChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Case UPPER' }));
    expect(onChange).toHaveBeenCalledWith('upper');
  });

  it('deselects active case kind on second click', () => {
    const onChange = jest.fn();
    render(<ConvertToolbar convertKind='upper' onConvertChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Case UPPER' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('calls onConvertChange with braille', () => {
    const onChange = jest.fn();
    render(<ConvertToolbar convertKind={null} onConvertChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Convert to Braille' }));
    expect(onChange).toHaveBeenCalledWith('braille');
  });

  it('deselects braille on second click', () => {
    const onChange = jest.fn();
    render(<ConvertToolbar convertKind='braille' onConvertChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Convert to Braille' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('calls onConvertChange with morse', () => {
    const onChange = jest.fn();
    render(<ConvertToolbar convertKind={null} onConvertChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Convert to Morse' }));
    expect(onChange).toHaveBeenCalledWith('morse');
  });

  it('calls onConvertChange with leet', () => {
    const onChange = jest.fn();
    render(<ConvertToolbar convertKind={null} onConvertChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Convert to Leet' }));
    expect(onChange).toHaveBeenCalledWith('leet');
  });

  it('highlights active case button', () => {
    render(<ConvertToolbar convertKind='title' onConvertChange={jest.fn()} />);
    const btn = screen.getByRole('button', { name: 'Title case' });
    expect(btn.className).toContain('btn-primary');
  });

  it('highlights active braille button', () => {
    render(<ConvertToolbar convertKind='braille' onConvertChange={jest.fn()} />);
    const btn = screen.getByRole('button', { name: 'Convert to Braille' });
    expect(btn.className).toContain('btn-primary');
  });

  it('does not highlight inactive buttons', () => {
    render(<ConvertToolbar convertKind='upper' onConvertChange={jest.fn()} />);
    const btn = screen.getByRole('button', { name: 'Case lower' });
    expect(btn.className).toContain('btn-ghost');
  });
});
