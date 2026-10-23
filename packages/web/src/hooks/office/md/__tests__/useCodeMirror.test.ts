import { act, renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useCodeMirror } from '@/hooks/office/md/useCodeMirror';

describe('useCodeMirror', () => {
  it('creates a view, edits the doc and focuses', () => {
    document.body.innerHTML = '<div id="host"></div>';
    const containerRef = createRef<HTMLDivElement | null>();
    containerRef.current = document.getElementById('host') as HTMLDivElement;
    const onChange = jest.fn();
    const onSelectionChange = jest.fn();

    const { result } = renderHook(() =>
      useCodeMirror({
        containerRef,
        initialDoc: 'hello',
        onChange,
        onSelectionChange,
      }),
    );

    expect(result.current.view).not.toBeNull();
    expect(result.current.getDoc()).toBe('hello');

    act(() => {
      result.current.setDoc('world');
    });
    expect(result.current.getDoc()).toBe('world');
    expect(onChange).toHaveBeenCalledWith('world');
    expect(onSelectionChange).toHaveBeenCalled();

    act(() => {
      result.current.focus();
    });
  });

  it('leaves the doc unchanged when setting identical content', () => {
    document.body.innerHTML = '<div id="host2"></div>';
    const containerRef = createRef<HTMLDivElement | null>();
    containerRef.current = document.getElementById('host2') as HTMLDivElement;
    const onChange = jest.fn();

    const { result } = renderHook(() =>
      useCodeMirror({ containerRef, initialDoc: 'same', onChange }),
    );

    act(() => {
      result.current.setDoc('same');
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.getDoc()).toBe('same');
  });

  it('no-ops when there is no container', () => {
    const containerRef = createRef<HTMLDivElement | null>();
    const { result } = renderHook(() => useCodeMirror({ containerRef }));

    expect(result.current.view).toBeNull();
    expect(result.current.getDoc()).toBe('');
    act(() => {
      result.current.setDoc('x');
    });
    expect(result.current.getDoc()).toBe('');
  });

  it('reports selection changes without a document change', () => {
    document.body.innerHTML = '<div id="host4"></div>';
    const containerRef = createRef<HTMLDivElement | null>();
    containerRef.current = document.getElementById('host4') as HTMLDivElement;
    const onChange = jest.fn();
    const onSelectionChange = jest.fn();

    const { result } = renderHook(() =>
      useCodeMirror({
        containerRef,
        initialDoc: 'hello',
        onChange,
        onSelectionChange,
      }),
    );

    act(() => {
      result.current.view?.dispatch({
        selection: { anchor: 0, head: 3 },
      });
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith(0, 3);
  });

  it('destroys the view when the container goes away', () => {
    document.body.innerHTML = '<div id="host3"></div>';
    const containerRef = createRef<HTMLDivElement | null>();
    containerRef.current = document.getElementById('host3') as HTMLDivElement;

    const { result, rerender } = renderHook(
      ({ container }) => useCodeMirror({ containerRef: container }),
      {
        initialProps: { container: containerRef },
      },
    );
    expect(result.current.view).not.toBeNull();

    const other = createRef<HTMLDivElement | null>();
    rerender({ container: other });
    expect(result.current.view).toBeNull();
  });
});
