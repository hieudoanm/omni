import { render, screen } from '@testing-library/react';
import { renderMarkdown } from '@/lib/office/keynotes/markdown';

describe('renderMarkdown', () => {
  it('renders headings with the right level', () => {
    const { container } = render(<div>{renderMarkdown('# Title\n## Sub')}</div>);
    const h1 = container.querySelector('h1');
    const h2 = container.querySelector('h2');
    expect(h1?.textContent).toBe('Title');
    expect(h2?.textContent).toBe('Sub');
  });

  it('renders bold, italic and inline code', () => {
    render(<div>{renderMarkdown('a **bold** b *italic* c `code` d')}</div>);
    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(screen.getByText('italic').tagName).toBe('EM');
    expect(screen.getByText('code').tagName).toBe('CODE');
  });

  it('renders links with a target', () => {
    render(<div>{renderMarkdown('see [docs](https://example.com)')}</div>);
    const link = screen.getByRole('link', { name: 'docs' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders fenced code blocks', () => {
    const { container } = render(<div>{renderMarkdown('```\nconst x = 1;\n```')}</div>);
    expect(container.querySelector('pre code')?.textContent).toBe('const x = 1;');
  });

  it('renders bullet and numbered lists', () => {
    const { container } = render(
      <div>{renderMarkdown('- one\n- two\n\n1. first\n2. second')}</div>,
    );
    const uls = container.querySelectorAll('ul');
    const ols = container.querySelectorAll('ol');
    expect(uls).toHaveLength(1);
    expect(ols).toHaveLength(1);
    expect(uls[0].textContent).toContain('one');
    expect(ols[0].textContent).toContain('first');
  });

  it('renders blockquotes and horizontal rules', () => {
    const { container } = render(<div>{renderMarkdown('> quoted\n\n---')}</div>);
    expect(container.querySelector('blockquote')?.textContent).toBe('quoted');
    expect(container.querySelector('hr')).not.toBeNull();
  });

  it('groups consecutive lines into a single paragraph', () => {
    render(<div>{renderMarkdown('line one\nline two')}</div>);
    expect(screen.getByText(/line one line two/)).toBeTruthy();
  });
});
