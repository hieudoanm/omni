import { renderHook, act } from '@testing-library/react';
import { useCaptions } from '@/hooks/office/keynotes/useCaptions';

interface MockRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: jest.Mock;
  stop: jest.Mock;
}

let mockRec: MockRecognition;
let MockSpeechRecognition: jest.Mock;

beforeEach(() => {
  mockRec = {
    lang: '',
    continuous: false,
    interimResults: false,
    onresult: null,
    onend: null,
    onerror: null,
    start: jest.fn(),
    stop: jest.fn(),
  };
  MockSpeechRecognition = jest.fn(() => mockRec);
  Object.defineProperty(window, 'SpeechRecognition', {
    writable: true,
    value: MockSpeechRecognition,
  });
  Object.defineProperty(window, 'webkitSpeechRecognition', {
    writable: true,
    value: undefined,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useCaptions', () => {
  it('reports no support when the Web Speech API is unavailable', () => {
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      writable: true,
      value: undefined,
    });
    const { result } = renderHook(() => useCaptions());
    expect(result.current.supported).toBe(false);
    expect(result.current.listening).toBe(false);
  });

  it('toggling without support is a no-op', () => {
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      writable: true,
      value: undefined,
    });
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.toggle());
    expect(result.current.listening).toBe(false);
    expect(result.current.text).toBe('');
  });

  it('reports support when SpeechRecognition is available', () => {
    const { result } = renderHook(() => useCaptions());
    expect(result.current.supported).toBe(true);
  });

  it('reports support when webkitSpeechRecognition is available', () => {
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      writable: true,
      value: MockSpeechRecognition,
    });
    const { result } = renderHook(() => useCaptions());
    expect(result.current.supported).toBe(true);
  });

  it('configures recognition with navigator.language', () => {
    renderHook(() => useCaptions());
    expect(mockRec.lang).toBe(navigator.language || 'en-US');
    expect(mockRec.continuous).toBe(true);
    expect(mockRec.interimResults).toBe(true);
  });

  it('starts listening when start is called', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    expect(mockRec.start).toHaveBeenCalled();
    expect(result.current.listening).toBe(true);
  });

  it('toggles to start when not listening', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.toggle());
    expect(mockRec.start).toHaveBeenCalled();
    expect(result.current.listening).toBe(true);
  });

  it('toggles to stop when listening', () => {
    mockRec.start.mockImplementation(() => {});
    mockRec.stop.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => result.current.toggle());
    expect(mockRec.stop).toHaveBeenCalled();
    expect(result.current.listening).toBe(false);
  });

  it('handles start throwing an error', () => {
    mockRec.start.mockImplementation(() => {
      throw new Error('already started');
    });
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    expect(result.current.listening).toBe(false);
  });

  it('stops listening when stop is called', () => {
    mockRec.start.mockImplementation(() => {});
    mockRec.stop.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => result.current.stop());
    expect(mockRec.stop).toHaveBeenCalled();
    expect(result.current.listening).toBe(false);
  });

  it('handles stop when rec is null (no support)', () => {
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      value: undefined,
    });
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.stop());
    expect(result.current.listening).toBe(false);
  });

  it('handles stop throwing an error', () => {
    mockRec.start.mockImplementation(() => {});
    mockRec.stop.mockImplementation(() => {
      throw new Error('not started');
    });
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => result.current.stop());
    expect(result.current.listening).toBe(false);
  });

  it('processes final results in onresult', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => {
      mockRec.onresult?.({
        results: [{ isFinal: true, 0: { transcript: 'Hello world' } }],
      });
    });
    expect(result.current.text).toBe('Hello world');
  });

  it('processes interim results in onresult', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => {
      mockRec.onresult?.({
        results: [{ isFinal: false, 0: { transcript: 'Hello world' } }],
      });
    });
    expect(result.current.text).toBe('Hello world');
  });

  it('accumulates final results across multiple onresult calls', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => {
      mockRec.onresult?.({
        results: [{ isFinal: true, 0: { transcript: 'Hello ' } }],
      });
    });
    act(() => {
      mockRec.onresult?.({
        results: [{ isFinal: true, 0: { transcript: 'world' } }],
      });
    });
    expect(result.current.text).toBe('Hello world');
  });

  it('clears interim text when new final results arrive', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => {
      mockRec.onresult?.({
        results: [{ isFinal: false, 0: { transcript: 'Hel' } }],
      });
    });
    act(() => {
      mockRec.onresult?.({
        results: [{ isFinal: true, 0: { transcript: 'Hello' } }],
      });
    });
    expect(result.current.text).toBe('Hello');
  });

  it('handles mixed final and interim results', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => {
      mockRec.onresult?.({
        results: [
          { isFinal: true, 0: { transcript: 'Hello ' } },
          { isFinal: false, 0: { transcript: 'wor' } },
        ],
      });
    });
    expect(result.current.text).toBe('Hello wor');
  });

  it('sets listening to false on error', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    expect(result.current.listening).toBe(true);
    act(() => {
      mockRec.onerror?.({ error: 'no-speech' });
    });
    expect(result.current.listening).toBe(false);
  });

  it('restarts on end when restartRef is true', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    expect(result.current.listening).toBe(true);
    act(() => {
      mockRec.onend?.();
    });
    expect(mockRec.start).toHaveBeenCalledTimes(2);
  });

  it('does not restart on end when restartRef is false', () => {
    mockRec.start.mockImplementation(() => {});
    mockRec.stop.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => result.current.stop());
    mockRec.start.mockClear();
    act(() => {
      mockRec.onend?.();
    });
    expect(mockRec.start).not.toHaveBeenCalled();
  });

  it('handles onend restart throwing an error', () => {
    mockRec.start
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error('already started');
      });
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => {
      mockRec.onend?.();
    });
    expect(result.current.listening).toBe(false);
  });

  it('handles onresult with empty results', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => {
      mockRec.onresult?.({
        results: [],
      });
    });
    expect(result.current.text).toBe('');
  });

  it('handles onresult with result having no transcript', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => {
      mockRec.onresult?.({
        results: [{ isFinal: true, 0: {} }],
      });
    });
  });

  it('cleans up recognition on unmount', () => {
    mockRec.start.mockImplementation(() => {});
    mockRec.stop.mockImplementation(() => {});
    const { unmount } = renderHook(() => useCaptions());
    unmount();
    expect(mockRec.stop).toHaveBeenCalled();
  });

  it('handles cleanup when stop throws on unmount', () => {
    mockRec.start.mockImplementation(() => {});
    mockRec.stop.mockImplementation(() => {
      throw new Error('already stopped');
    });
    const { unmount } = renderHook(() => useCaptions());
    expect(() => unmount()).not.toThrow();
  });

  it('clears final and interim on fresh start', () => {
    mockRec.start.mockImplementation(() => {});
    const { result } = renderHook(() => useCaptions());
    act(() => result.current.start());
    act(() => {
      mockRec.onresult?.({
        results: [{ isFinal: true, 0: { transcript: 'old text' } }],
      });
    });
    expect(result.current.text).toBe('old text');
    act(() => result.current.start());
    expect(result.current.text).toBe('');
  });

  it('uses fallback en-US when navigator.language is empty', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'language');
    Object.defineProperty(navigator, 'language', {
      value: '',
      configurable: true,
    });
    renderHook(() => useCaptions());
    expect(mockRec.lang).toBe('en-US');
    if (original) Object.defineProperty(navigator, 'language', original);
  });
});
