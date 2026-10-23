import { act, renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useScrollSync } from '@/hooks/office/md/useScrollSync';

const makeScrollable = (scrollHeight: number, clientHeight: number): HTMLDivElement => {
  const el = document.createElement('div');
  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  });
  el.scrollTop = 0;
  return el;
};

const flushRaf = async (): Promise<void> => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
};

describe('useScrollSync', () => {
  it('attaches no listeners when disabled or elements are missing', () => {
    const preview = makeScrollable(2000, 500);
    const editor = makeScrollable(1000, 500);
    const previewRef = createRef<HTMLDivElement | null>();
    previewRef.current = preview;

    renderHook(() => useScrollSync(editor, previewRef, false));
    editor.scrollTop = 100;
    act(() => {
      editor.dispatchEvent(new Event('scroll'));
    });
    expect(preview.scrollTop).toBe(0);

    renderHook(() => useScrollSync(null, previewRef, true));
  });

  it('mirrors editor scroll onto the preview', async () => {
    const preview = makeScrollable(2000, 500);
    const editor = makeScrollable(1000, 500);
    const previewRef = createRef<HTMLDivElement | null>();
    previewRef.current = preview;

    renderHook(() => useScrollSync(editor, previewRef, true));
    editor.scrollTop = 100;
    act(() => {
      editor.dispatchEvent(new Event('scroll'));
    });
    await flushRaf();
    expect(preview.scrollTop).toBe(300);
  });

  it('mirrors preview scroll onto the editor', async () => {
    const preview = makeScrollable(2000, 500);
    const editor = makeScrollable(1000, 500);
    const previewRef = createRef<HTMLDivElement | null>();
    previewRef.current = preview;

    renderHook(() => useScrollSync(editor, previewRef, true));
    preview.scrollTop = 300;
    act(() => {
      preview.dispatchEvent(new Event('scroll'));
    });
    await flushRaf();
    expect(editor.scrollTop).toBe(100);
  });

  it('skips syncing when a side is not scrollable', async () => {
    const preview = makeScrollable(500, 500);
    const editor = makeScrollable(1000, 500);
    const previewRef = createRef<HTMLDivElement | null>();
    previewRef.current = preview;

    renderHook(() => useScrollSync(editor, previewRef, true));
    editor.scrollTop = 100;
    act(() => {
      editor.dispatchEvent(new Event('scroll'));
    });
    await flushRaf();
    expect(preview.scrollTop).toBe(0);
  });

  it('drops duplicate scroll events while a sync is in flight', async () => {
    const preview = makeScrollable(2000, 500);
    const editor = makeScrollable(1000, 500);
    const previewRef = createRef<HTMLDivElement | null>();
    previewRef.current = preview;

    renderHook(() => useScrollSync(editor, previewRef, true));
    editor.scrollTop = 50;
    act(() => {
      editor.dispatchEvent(new Event('scroll'));
    });
    editor.scrollTop = 100;
    act(() => {
      editor.dispatchEvent(new Event('scroll'));
    });
    await flushRaf();
    expect(preview.scrollTop).toBe(150);

    act(() => {
      editor.dispatchEvent(new Event('scroll'));
    });
    await flushRaf();
    expect(preview.scrollTop).toBe(300);
  });

  it('removes listeners on unmount', async () => {
    const preview = makeScrollable(2000, 500);
    const editor = makeScrollable(1000, 500);
    const previewRef = createRef<HTMLDivElement | null>();
    previewRef.current = preview;

    const { unmount } = renderHook(() => useScrollSync(editor, previewRef, true));
    unmount();
    editor.scrollTop = 100;
    act(() => {
      editor.dispatchEvent(new Event('scroll'));
    });
    await flushRaf();
    expect(preview.scrollTop).toBe(0);
  });
});
