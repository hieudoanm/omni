import { act, renderHook } from '@testing-library/react';
import { renderMarkdown } from '@/lib/office/md/markdown';
import { useMarkdownRender } from '@/hooks/office/md/useMarkdownRender';

jest.mock('@/lib/office/md/markdown', () => ({
  renderMarkdown: jest.fn(),
}));

const mockRender = renderMarkdown as jest.Mock;

describe('useMarkdownRender', () => {
  it('renders content and reports the busy state', async () => {
    let resolve: (value: string) => void;
    mockRender.mockImplementationOnce(() => new Promise<string>((res) => (resolve = res)));

    const { result } = renderHook(() => useMarkdownRender('# hi'));
    expect(result.current.isRendering).toBe(true);

    await act(async () => {
      resolve!('<h1>hi</h1>');
    });
    expect(result.current.html).toBe('<h1>hi</h1>');
    expect(result.current.isRendering).toBe(false);
  });

  it('ignores stale renders after the content changes', async () => {
    let resolve: (value: string) => void;
    mockRender
      .mockImplementationOnce(() => new Promise<string>((res) => (resolve = res)))
      .mockImplementationOnce(() => Promise.resolve('<b>two</b>'));

    const { result, rerender } = renderHook(({ content }) => useMarkdownRender(content), {
      initialProps: { content: 'one' },
    });

    rerender({ content: 'two' });
    expect(result.current.html).toBe('');

    await act(async () => {
      resolve!('<b>one</b>');
    });
    expect(result.current.html).toBe('<b>two</b>');
    expect(result.current.isRendering).toBe(false);
  });
});
