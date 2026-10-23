import { morsify, applyMorse, playMorse } from '../morse';

describe('morsify', () => {
  it('converts a single letter', () => {
    expect(morsify('a')).toBe('.-');
  });

  it('converts SOS', () => {
    expect(morsify('SOS')).toBe('... --- ...');
  });

  it('handles spaces between words', () => {
    expect(morsify('a b')).toBe('.- / -...');
  });

  it('handles mixed case', () => {
    expect(morsify('Hello')).toBe('.... . .-.. .-.. ---');
  });

  it('returns empty string for empty input', () => {
    expect(morsify('')).toBe('');
  });

  it('filters unknown characters', () => {
    expect(morsify('hi@')).toBe('.... ..');
  });

  it('handles digits', () => {
    expect(morsify('123')).toBe('.---- ..--- ...--');
  });
});

describe('applyMorse', () => {
  it('converts entire document when no selection', () => {
    const result = applyMorse('hi', 2, 2);
    expect(result.text).toBe('.... ..');
  });

  it('converts selected range only', () => {
    const result = applyMorse('hi world', 0, 2);
    expect(result.text).toBe('.... .. world');
  });

  it('places cursor at start when no selection', () => {
    const result = applyMorse('ab', 2, 2);
    expect(result.selectionStart).toBe(0);
    expect(result.selectionEnd).toBe(result.text.length);
  });
});

describe('playMorse', () => {
  beforeAll(() => {
    const mockOsc = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { value: 0 },
    };
    const mockGain = {
      connect: jest.fn(),
      gain: { setValueAtTime: jest.fn() },
    };
    const mockCtx = {
      currentTime: 0,
      destination: {},
      createOscillator: jest.fn(() => mockOsc),
      createGain: jest.fn(() => mockGain),
    };
    (globalThis as any).AudioContext = jest.fn(() => mockCtx);
    (globalThis as any).webkitAudioContext = undefined;
  });

  jest.useFakeTimers();

  it('calls onDone after playback', () => {
    const onDone = jest.fn();
    playMorse('a', onDone);
    jest.runAllTimers();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('does not throw for empty string', () => {
    const onDone = jest.fn();
    expect(() => playMorse('', onDone)).not.toThrow();
    jest.runAllTimers();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('handles word gaps and slashes during playback', () => {
    const onDone = jest.fn();
    playMorse('a b', onDone);
    jest.runAllTimers();
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
