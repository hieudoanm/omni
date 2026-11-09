import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  PanelSection,
  ColorInput,
  NumberInput,
  Toggle,
  SelectInput,
  TextArea,
} from '@/components/office/keynotes/atoms/FormControls';

describe('PanelSection', () => {
  it('renders with title and children', () => {
    render(
      <PanelSection title='My Section'>
        <p>Content</p>
      </PanelSection>,
    );
    expect(screen.getByText('My Section')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('is open by default', () => {
    render(
      <PanelSection title='Open'>
        <p>Visible</p>
      </PanelSection>,
    );
    expect(screen.getByText('Visible')).toBeVisible();
  });

  it('can be closed when defaultOpen is false', () => {
    render(
      <PanelSection title='Closed' defaultOpen={false}>
        <p>Hidden</p>
      </PanelSection>,
    );
    expect(screen.getByText('Hidden')).not.toBeVisible();
  });

  it('toggles open/close on summary click', () => {
    render(
      <PanelSection title='Toggle'>
        <p>ToggleContent</p>
      </PanelSection>,
    );
    expect(screen.getByText('ToggleContent')).toBeVisible();
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByText('ToggleContent').closest('div')).not.toBeVisible();
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByText('ToggleContent')).toBeVisible();
  });
});

describe('ColorInput', () => {
  it('renders with label and hex value', () => {
    render(<ColorInput label='Fill' value='#ff0000' onChange={jest.fn()} />);
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getAllByDisplayValue('#ff0000').length).toBe(2);
  });

  it('calls onChange when text input changes', () => {
    const onChange = jest.fn();
    render(<ColorInput label='Fill' value='#000000' onChange={onChange} />);
    const textInput = screen
      .getAllByDisplayValue('#000000')
      .find((el) => el.tagName === 'INPUT' && el.getAttribute('type') === 'text')!;
    fireEvent.change(textInput, { target: { value: '#abcdef' } });
    expect(onChange).toHaveBeenCalledWith('#abcdef');
  });

  it('calls onChange when color picker changes', () => {
    const onChange = jest.fn();
    render(<ColorInput label='Fill' value='#000000' onChange={onChange} />);
    const colorInput = screen
      .getAllByDisplayValue('#000000')
      .find((el) => el.tagName === 'INPUT' && el.getAttribute('type') === 'color')!;
    fireEvent.change(colorInput, { target: { value: '#112233' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('falls back to #000000 for invalid hex', () => {
    render(<ColorInput label='Fill' value='invalid' onChange={jest.fn()} />);
    const colorInput = document.querySelector('input[type="color"]');
    expect(colorInput).toHaveValue('#000000');
  });

  it('renders palette swatches by default', () => {
    render(<ColorInput label='Fill' value='#000000' onChange={jest.fn()} />);
    expect(screen.getByLabelText('Color #111827')).toBeInTheDocument();
  });

  it('hides palette swatches when swatches is false', () => {
    render(<ColorInput label='Fill' value='#000000' onChange={jest.fn()} swatches={false} />);
    expect(screen.queryByLabelText('Color #111827')).not.toBeInTheDocument();
  });

  it('clicks a palette swatch to select it', () => {
    const onChange = jest.fn();
    render(<ColorInput label='Fill' value='#000000' onChange={onChange} />);
    const swatch = screen.getByLabelText('Color #ef4444');
    fireEvent.click(swatch);
    expect(onChange).toHaveBeenCalledWith('#ef4444');
  });

  it('highlights the active color in palette', () => {
    render(<ColorInput label='Fill' value='#ef4444' onChange={jest.fn()} />);
    const swatch = screen.getByLabelText('Color #ef4444');
    expect(swatch.className).toContain('ring-primary');
  });
});

describe('NumberInput', () => {
  it('renders with label and value', () => {
    render(<NumberInput label='Width' value={100} onChange={jest.fn()} />);
    expect(screen.getByText('Width')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('calls onChange with number', () => {
    const onChange = jest.fn();
    render(<NumberInput label='Width' value={100} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue('100'), {
      target: { value: '200' },
    });
    expect(onChange).toHaveBeenCalledWith(200);
  });

  it('passes min/max/step props', () => {
    render(
      <NumberInput label='Opacity' value={0.5} onChange={jest.fn()} min={0} max={1} step={0.1} />,
    );
    const input = screen.getByDisplayValue('0.5');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '1');
    expect(input).toHaveAttribute('step', '0.1');
  });
});

describe('Toggle', () => {
  it('renders with label and unchecked', () => {
    render(<Toggle label='Locked' checked={false} onChange={jest.fn()} />);
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders checked state', () => {
    render(<Toggle label='Locked' checked={true} onChange={jest.fn()} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange with toggled value', () => {
    const onChange = jest.fn();
    render(<Toggle label='Locked' checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange to uncheck', () => {
    const onChange = jest.fn();
    render(<Toggle label='Locked' checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});

describe('SelectInput', () => {
  const options = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
  ];

  it('renders with label and options', () => {
    render(<SelectInput label='Theme' value='dark' options={options} onChange={jest.fn()} />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dark')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    const onChange = jest.fn();
    render(<SelectInput label='Theme' value='dark' options={options} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue('Dark'), {
      target: { value: 'light' },
    });
    expect(onChange).toHaveBeenCalledWith('light');
  });
});

describe('TextArea', () => {
  it('renders with value', () => {
    render(<TextArea value='Hello world' onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument();
  });

  it('renders with optional label', () => {
    render(<TextArea label='Notes' value='test' onChange={jest.fn()} />);
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders without label', () => {
    const { container } = render(<TextArea value='test' onChange={jest.fn()} />);
    expect(container.querySelector('textarea')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const onChange = jest.fn();
    render(<TextArea value='' onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new text' },
    });
    expect(onChange).toHaveBeenCalledWith('new text');
  });

  it('passes rows prop', () => {
    render(<TextArea value='' onChange={jest.fn()} rows={8} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8');
  });

  it('defaults to 4 rows', () => {
    render(<TextArea value='' onChange={jest.fn()} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
  });
});
