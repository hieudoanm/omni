import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { MarkdownPreviewer } from '@/components/office/md/organisms/MarkdownPreviewer';

jest.mock('@/lib/office/md/typoglycemia', () => ({
  scrambleNodes: jest.fn(),
  applyCaseNodes: jest.fn(),
}));

const renderPreviewer = (overrides = {}) => {
  const props = {
    html: '<p>rendered html</p>',
    isRendering: false,
    previewRef: createRef<HTMLDivElement | null>(),
    visible: true,
    ...overrides,
  };
  render(<MarkdownPreviewer {...props} />);
  return props;
};

describe('MarkdownPreviewer', () => {
  it('renders the html when not busy', () => {
    renderPreviewer();
    expect(screen.getByTestId('markdown-preview').innerHTML).toBe('<p>rendered html</p>');
  });

  it('shows the rendering spinner while busy', () => {
    renderPreviewer({ isRendering: true, html: '<p>x</p>' });
    expect(screen.getByText('Rendering…')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
  });

  it('hides the panel when not visible', () => {
    const { container } = render(
      <MarkdownPreviewer
        html='<p>x</p>'
        isRendering={false}
        previewRef={createRef<HTMLDivElement | null>()}
        visible={false}
      />,
    );
    expect(container.firstElementChild).toHaveClass('hidden');
  });

  it('attaches the ref to the wrapper', () => {
    const previewRef = createRef<HTMLDivElement | null>();
    renderPreviewer({ previewRef });
    expect(previewRef.current).not.toBeNull();
    expect(previewRef.current).toHaveAttribute('aria-label', 'Markdown preview');
  });

  it('shows the typoglycemia toggle when onToggleScramble is provided', () => {
    renderPreviewer({
      onToggleScramble: jest.fn(),
      scramble: false,
    });
    expect(screen.getByRole('button', { name: 'Enable typoglycemia' })).toBeInTheDocument();
  });

  it('hides the toggle when onToggleScramble is not provided', () => {
    renderPreviewer();
    expect(screen.queryByRole('button', { name: /typoglycemia/i })).not.toBeInTheDocument();
  });

  it('calls onToggleScramble when the toggle is clicked', () => {
    const onToggleScramble = jest.fn();
    renderPreviewer({ onToggleScramble, scramble: false });
    fireEvent.click(screen.getByRole('button', { name: 'Enable typoglycemia' }));
    expect(onToggleScramble).toHaveBeenCalledTimes(1);
  });

  it('shows "Disable typoglycemia" label when scramble is active', () => {
    renderPreviewer({
      onToggleScramble: jest.fn(),
      scramble: true,
    });
    expect(screen.getByRole('button', { name: 'Disable typoglycemia' })).toBeInTheDocument();
  });

  it('applies active style when scramble is enabled', () => {
    renderPreviewer({
      onToggleScramble: jest.fn(),
      scramble: true,
    });
    const btn = screen.getByRole('button', { name: 'Disable typoglycemia' });
    expect(btn.className).toContain('btn-primary');
  });

  it('accepts convertKind prop without error', () => {
    renderPreviewer({ convertKind: 'upper' });
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('accepts braille convertKind without error', () => {
    renderPreviewer({ convertKind: 'braille' });
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('accepts morse convertKind without error', () => {
    renderPreviewer({ convertKind: 'morse' });
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });

  it('accepts leet convertKind without error', () => {
    renderPreviewer({ convertKind: 'leet' });
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
  });
});
