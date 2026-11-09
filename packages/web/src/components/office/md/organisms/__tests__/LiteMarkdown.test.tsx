import { LiteMarkdownApp } from '@/components/office/md/organisms/LiteMarkdownApp';
import { saveNotes } from '@/lib/office/md/storage';
import { act, render, screen, waitFor } from '@testing-library/react';

let mockOnEditorChange: ((content: string) => void) | undefined;
let mockInitialDoc: string | undefined;

jest.mock('@/hooks/office/md/useCodeMirror', () => ({
  useCodeMirror: (options: { initialDoc?: string; onChange?: (content: string) => void }) => {
    mockOnEditorChange = options.onChange;
    mockInitialDoc = options.initialDoc;
    return {
      view: null,
      setDoc: jest.fn(),
      getDoc: () => '',
      focus: jest.fn(),
    };
  },
}));

jest.mock('@/hooks/office/md/useMarkdownRender', () => ({
  useMarkdownRender: (content: string) => ({
    html: `<p>${content}</p>`,
    isRendering: false,
  }),
}));

jest.mock('@/lib/office/md/storage', () => {
  const actual = jest.requireActual('@/lib/office/md/storage');
  return { ...actual, saveNotes: jest.fn() };
});

describe('LiteMarkdownApp', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockOnEditorChange = undefined;
    mockInitialDoc = undefined;
    jest.clearAllMocks();
  });

  it('renders the editor and a live preview', () => {
    render(<LiteMarkdownApp />);
    expect(screen.getByTestId('editor')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    expect(mockInitialDoc).toBe(screen.getByTestId('markdown-preview').textContent);
  });

  it('updates the preview as the editor changes', () => {
    render(<LiteMarkdownApp />);
    const preview = screen.getByTestId('markdown-preview');
    const onEditorChange = mockOnEditorChange;
    if (!onEditorChange) throw new Error('onChange not captured');
    act(() => onEditorChange('# Updated'));
    expect(preview).toHaveTextContent('# Updated');
  });
});
