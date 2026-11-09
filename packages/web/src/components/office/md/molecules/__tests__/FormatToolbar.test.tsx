import { fireEvent, render, screen } from '@testing-library/react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { FormatToolbar } from '@/components/office/md/molecules/FormatToolbar';

const createView = (doc: string): EditorView => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const view = new EditorView({
    state: EditorState.create({ doc, extensions: [] }),
    parent: host,
  });
  return view;
};

describe('FormatToolbar', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('disables every button when there is no view', () => {
    render(<FormatToolbar view={null} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => expect(button).toBeDisabled());
  });

  it.each([
    ['Bold', '**word**'],
    ['Italic', '*word*'],
    ['Strikethrough', '~~word~~'],
    ['Inline code', '`word`'],
    ['Code block', '```\nword\n```'],
    ['Quote', '> word'],
    ['Bullet list', '- word'],
    ['Numbered list', '1. word'],
    ['Task list', '- [ ] word'],
    ['Link', '[word](https://example.com)'],
    ['Image', '![word](https://example.com)'],
    ['Divider', 'word\n\n---\n\n'],
  ])('applies %s formatting to the selection', (label, expected) => {
    const view = createView('word');
    view.dispatch({ selection: { anchor: 0, head: 4 } });
    render(<FormatToolbar view={view} />);

    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(view.state.doc.toString()).toBe(expected);
  });

  it.each([
    ['Heading 1', '1', '# line'],
    ['Heading 2', '2', '## line'],
    ['Heading 3', '3', '### line'],
  ])('inserts %s at the cursor', (label, level, expected) => {
    const view = createView('line');
    view.dispatch({ selection: { anchor: 2, head: 2 } });
    render(<FormatToolbar view={view} />);

    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(view.state.doc.toString()).toBe(expected);
  });

  it('inserts a table from the prompt dimensions', () => {
    jest.spyOn(window, 'prompt').mockReturnValue('2x3');
    const view = createView('text');
    render(<FormatToolbar view={view} />);

    fireEvent.click(screen.getByRole('button', { name: 'Table' }));
    const doc = view.state.doc.toString();
    expect(doc).toContain('| Column | Column | Column |');
    expect(doc).toContain('| --- | --- | --- |');
    expect(doc).toContain('|  |  |  |');
  });

  it('parses the unicode times sign in table dimensions', () => {
    jest.spyOn(window, 'prompt').mockReturnValue('2×2');
    const view = createView('text');
    render(<FormatToolbar view={view} />);

    fireEvent.click(screen.getByRole('button', { name: 'Table' }));
    expect(view.state.doc.toString()).toContain('| Column | Column |\n| --- | --- |\n|  |  |');
  });

  it('leaves the doc untouched when the prompt is cancelled', () => {
    jest.spyOn(window, 'prompt').mockReturnValue(null);
    const view = createView('text');
    render(<FormatToolbar view={view} />);

    fireEvent.click(screen.getByRole('button', { name: 'Table' }));
    expect(view.state.doc.toString()).toBe('text');
  });

  it('leaves the doc untouched when the dimensions are invalid', () => {
    jest.spyOn(window, 'prompt').mockReturnValue('abc');
    const view = createView('text');
    render(<FormatToolbar view={view} />);

    fireEvent.click(screen.getByRole('button', { name: 'Table' }));
    expect(view.state.doc.toString()).toBe('text');
  });

  it('leaves the doc untouched when the column count is invalid', () => {
    jest.spyOn(window, 'prompt').mockReturnValue('3x');
    const view = createView('text');
    render(<FormatToolbar view={view} />);

    fireEvent.click(screen.getByRole('button', { name: 'Table' }));
    expect(view.state.doc.toString()).toBe('text');
  });
});
