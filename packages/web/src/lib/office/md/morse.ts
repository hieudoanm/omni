import type { SelectionEdit } from '@/lib/office/md/format';

export const MORSE_MAP: Record<string, { code: string; pattern: string }> = {
  a: { code: '.-', pattern: 'di-dah' },
  b: { code: '-...', pattern: 'dah-di-di-dit' },
  c: { code: '-.-.', pattern: 'dah-di-dah-dit' },
  d: { code: '-..', pattern: 'dah-di-dit' },
  e: { code: '.', pattern: 'dit' },
  f: { code: '..-.', pattern: 'di-di-dah-dit' },
  g: { code: '--.', pattern: 'dah-dah-dit' },
  h: { code: '....', pattern: 'di-di-di-dit' },
  i: { code: '..', pattern: 'di-dit' },
  j: { code: '.---', pattern: 'di-dah-dah-dah' },
  k: { code: '-.-', pattern: 'dah-di-dah' },
  l: { code: '.-..', pattern: 'di-dah-di-dit' },
  m: { code: '--', pattern: 'dah-dah' },
  n: { code: '-.', pattern: 'dah-dit' },
  o: { code: '---', pattern: 'dah-dah-dah' },
  p: { code: '.--.', pattern: 'di-dah-dah-dit' },
  q: { code: '--.-', pattern: 'dah-dah-di-dah' },
  r: { code: '.-.', pattern: 'di-dah-dit' },
  s: { code: '...', pattern: 'di-di-dit' },
  t: { code: '-', pattern: 'dah' },
  u: { code: '..-', pattern: 'di-di-dah' },
  v: { code: '...-', pattern: 'di-di-di-dah' },
  w: { code: '.--', pattern: 'di-dah-dah' },
  x: { code: '-..-', pattern: 'dah-di-di-dah' },
  y: { code: '-.--', pattern: 'dah-di-dah-dah' },
  z: { code: '--..', pattern: 'dah-dah-di-dit' },
  '1': { code: '.----', pattern: 'di-dah-dah-dah-dah' },
  '2': { code: '..---', pattern: 'di-di-dah-dah-dah' },
  '3': { code: '...--', pattern: 'di-di-di-dah-dah' },
  '4': { code: '....-', pattern: 'di-di-di-di-dah' },
  '5': { code: '.....', pattern: 'di-di-di-di-dit' },
  '6': { code: '-....', pattern: 'dah-di-di-di-dit' },
  '7': { code: '--...', pattern: 'dah-dah-di-di-dit' },
  '8': { code: '---..', pattern: 'dah-dah-dah-di-dit' },
  '9': { code: '----.', pattern: 'dah-dah-dah-dah-dit' },
  '0': { code: '-----', pattern: 'dah-dah-dah-dah-dah' },
  '.': { code: '.-.-.-', pattern: 'di-dah-di-dah-di-dah' },
  ',': { code: '--..--', pattern: 'dah-dah-di-di-dah-dah' },
  '?': { code: '..--..', pattern: 'di-di-dah-dah-di-dit' },
  "'": { code: '.----.', pattern: 'di-dah-dah-dah-dah-dit' },
  '!': { code: '-.-.--', pattern: 'dah-di-dah-di-dah-dah' },
  '/': { code: '-..-.', pattern: 'dah-di-di-dah-dit' },
  ' ': { code: '/', pattern: 'word-space' },
};

export const morsify = (text: string): string =>
  text
    .split('')
    .map((ch) => MORSE_MAP[ch.toLowerCase()]?.code ?? '')
    .filter(Boolean)
    .join(' ');

export const applyMorse = (doc: string, start: number, end: number): SelectionEdit => {
  const hasSelection = start !== end;
  const targetStart = hasSelection ? start : 0;
  const targetEnd = hasSelection ? end : doc.length;
  const converted = morsify(doc.slice(targetStart, targetEnd));

  return {
    text: `${doc.slice(0, targetStart)}${converted}${doc.slice(targetEnd)}`,
    selectionStart: targetStart,
    selectionEnd: targetStart + converted.length,
  };
};

const walkTextNodes = (root: HTMLElement, fn: (text: string) => string): void => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (!node.parentElement) continue;
    if (node.parentElement.closest('code, pre, textarea')) continue;
    node.textContent = fn(node.textContent ?? '');
  }
};

export const applyMorseNodes = (root: HTMLElement): void => {
  walkTextNodes(root, morsify);
};

export const playMorse = (text: string, onDone: () => void) => {
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const unit = 0.08;
  const freq = 600;
  const morseStr = morsify(text);
  let time = ctx.currentTime + 0.1;

  const beep = (dur: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.4, time);
    osc.start(time);
    osc.stop(time + dur);
    time += dur;
  };

  const gap = (dur: number) => {
    time += dur;
  };

  for (const ch of morseStr) {
    if (ch === '.') {
      beep(unit);
      gap(unit);
    } else if (ch === '-') {
      beep(unit * 3);
      gap(unit);
    } else if (ch === ' ') {
      gap(unit * 3);
    } else if (ch === '/') {
      gap(unit * 7);
    }
  }

  const totalMs =
    morseStr.split('').reduce((acc, ch) => {
      if (ch === '.') return acc + unit * 2;
      if (ch === '-') return acc + unit * 4;
      if (ch === ' ') return acc + unit * 3;
      if (ch === '/') return acc + unit * 7;
      return acc;
    }, 0) * 1000;

  setTimeout(onDone, totalMs + 300);
};
