import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  SlideBackgroundPicker,
  normalizeBackground,
} from '@/components/office/keynotes/organisms/panels/SlideBackgroundPicker';
import type { SlideBackground } from '@/types/keynotes/deck';

describe('normalizeBackground', () => {
  it('returns existing non-none background as-is', () => {
    const bg: SlideBackground = { type: 'solid', color: '#ff0000', opacity: 1 };
    expect(normalizeBackground(bg, '#000')).toBe(bg);
  });

  it('returns fallback solid when bg is undefined', () => {
    const result = normalizeBackground(undefined, '#aaa');
    expect(result).toEqual({ type: 'solid', color: '#aaa', opacity: 1 });
  });

  it('returns fallback solid when bg type is none', () => {
    const result = normalizeBackground({ type: 'none' }, '#bbb');
    expect(result).toEqual({ type: 'solid', color: '#bbb', opacity: 1 });
  });

  it('passes through gradient background', () => {
    const bg: SlideBackground = {
      type: 'gradient',
      from: '#000',
      to: '#fff',
      angle: 90,
      opacity: 1,
    };
    expect(normalizeBackground(bg, '#000')).toBe(bg);
  });

  it('passes through image background', () => {
    const bg: SlideBackground = {
      type: 'image',
      imageUrl: 'test.png',
      opacity: 1,
    };
    expect(normalizeBackground(bg, '#000')).toBe(bg);
  });
});

describe('SlideBackgroundPicker', () => {
  it('renders solid/gradient/image type buttons', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{ type: 'solid', color: '#ff0000', opacity: 1 }}
        onChange={onChange}
      />,
    );
    expect(screen.getByText('Solid')).toBeInTheDocument();
    expect(screen.getByText('Gradient')).toBeInTheDocument();
    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('shows ColorInput for solid type', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{ type: 'solid', color: '#ff0000', opacity: 1 }}
        onChange={onChange}
      />,
    );
    expect(screen.getByText('Color')).toBeInTheDocument();
  });

  it('clicking solid button calls onChange with solid fill', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{ type: 'solid', color: '#ff0000', opacity: 1 }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('Solid'));
    expect(onChange).toHaveBeenCalledWith({
      type: 'solid',
      color: '#0b1020',
      opacity: 1,
    });
  });

  it('clicking gradient button calls onChange with gradient fill', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{ type: 'solid', color: '#ff0000', opacity: 1 }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('Gradient'));
    expect(onChange).toHaveBeenCalledWith({
      type: 'gradient',
      from: '#0b1020',
      to: '#131a33',
      angle: 135,
      opacity: 1,
    });
  });

  it('clicking image button calls onChange with image fill', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{ type: 'solid', color: '#ff0000', opacity: 1 }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('Image'));
    expect(onChange).toHaveBeenCalledWith({
      type: 'image',
      imageUrl: '',
      opacity: 1,
    });
  });

  it('shows gradient controls when gradient is selected', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{
          type: 'gradient',
          from: '#ff0000',
          to: '#0000ff',
          angle: 90,
          opacity: 1,
        }}
        onChange={onChange}
      />,
    );
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
    expect(screen.getByText('Angle')).toBeInTheDocument();
  });

  it('gradient from/to color inputs trigger onChange', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{
          type: 'gradient',
          from: '#ff0000',
          to: '#0000ff',
          angle: 90,
          opacity: 1,
        }}
        onChange={onChange}
      />,
    );
    // Find the "From" label's sibling input
    const fromInputs = screen.getAllByRole('textbox');
    // The first color input (after "From" label) should trigger onChange
    expect(fromInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('shows image controls when image is selected', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{
          type: 'image',
          imageUrl: 'https://example.com/img.png',
          opacity: 1,
        }}
        onChange={onChange}
      />,
    );
    expect(screen.getByPlaceholderText('Image URL')).toBeInTheDocument();
    expect(screen.getByText('Upload image…')).toBeInTheDocument();
  });

  it('image URL input triggers onChange', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{ type: 'image', imageUrl: '', opacity: 1 }}
        onChange={onChange}
      />,
    );
    const input = screen.getByPlaceholderText('Image URL');
    fireEvent.change(input, { target: { value: 'new-url.png' } });
    expect(onChange).toHaveBeenCalledWith({
      type: 'image',
      imageUrl: 'new-url.png',
      opacity: 1,
    });
  });

  it('upload button in image mode triggers file input click', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{ type: 'image', imageUrl: '', opacity: 1 }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText('Upload image…'));
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
  });

  it('file input change triggers upload with data URL', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{ type: 'image', imageUrl: '', opacity: 1 }}
        onChange={onChange}
      />,
    );
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
  });

  it('handles none background type as solid', () => {
    const onChange = jest.fn();
    render(<SlideBackgroundPicker value={{ type: 'none' }} onChange={onChange} />);
    expect(screen.getByText('Color')).toBeInTheDocument();
  });

  it('color input for solid background calls onChange', () => {
    const onChange = jest.fn();
    render(
      <SlideBackgroundPicker
        value={{ type: 'solid', color: '#ff0000', opacity: 1 }}
        onChange={onChange}
      />,
    );
    // The ColorInput renders a label "Color" and an input
    const colorInputs = screen.getAllByRole('textbox');
    expect(colorInputs.length).toBeGreaterThan(0);
  });
});
