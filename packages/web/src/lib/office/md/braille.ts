import type { SelectionEdit } from '@/lib/office/md/format';

export const BRAILLE_MAP: Record<string, { unicode: string; dots: string; character: string }> = {
  a: { unicode: 'U+2801', dots: '1', character: '⠁' },
  b: { unicode: 'U+2803', dots: '1-2', character: '⠃' },
  c: { unicode: 'U+2809', dots: '1-4', character: '⠉' },
  d: { unicode: 'U+2819', dots: '1-4-5', character: '⠙' },
  e: { unicode: 'U+2811', dots: '1-5', character: '⠑' },
  f: { unicode: 'U+280B', dots: '1-2-4', character: '⠋' },
  g: { unicode: 'U+281B', dots: '1-2-4-5', character: '⠛' },
  h: { unicode: 'U+2813', dots: '1-2-5', character: '⠓' },
  i: { unicode: 'U+280A', dots: '2-4', character: '⠊' },
  j: { unicode: 'U+281A', dots: '2-4-5', character: '⠚' },
  k: { unicode: 'U+2805', dots: '1-3', character: '⠅' },
  l: { unicode: 'U+2807', dots: '1-2-3', character: '⠇' },
  m: { unicode: 'U+280D', dots: '1-3-4', character: '⠍' },
  n: { unicode: 'U+281D', dots: '1-3-4-5', character: '⠝' },
  o: { unicode: 'U+2815', dots: '1-3-5', character: '⠕' },
  p: { unicode: 'U+280F', dots: '1-2-3-4', character: '⠏' },
  q: { unicode: 'U+281F', dots: '1-2-3-4-5', character: '⠟' },
  r: { unicode: 'U+2817', dots: '1-2-3-5', character: '⠗' },
  s: { unicode: 'U+280E', dots: '2-3-4', character: '⠎' },
  t: { unicode: 'U+281E', dots: '2-3-4-5', character: '⠞' },
  u: { unicode: 'U+2825', dots: '1-3-6', character: '⠥' },
  v: { unicode: 'U+2827', dots: '1-2-3-6', character: '⠧' },
  w: { unicode: 'U+283A', dots: '2-4-5-6', character: '⠺' },
  x: { unicode: 'U+282D', dots: '1-3-4-6', character: '⠭' },
  y: { unicode: 'U+283D', dots: '1-3-4-5-6', character: '⠽' },
  z: { unicode: 'U+2835', dots: '1-3-5-6', character: '⠵' },
  '1': { unicode: 'U+2801', dots: '1', character: '⠁' },
  '2': { unicode: 'U+2803', dots: '1-2', character: '⠃' },
  '3': { unicode: 'U+2809', dots: '1-4', character: '⠉' },
  '4': { unicode: 'U+2819', dots: '1-4-5', character: '⠙' },
  '5': { unicode: 'U+2811', dots: '1-5', character: '⠑' },
  '6': { unicode: 'U+280B', dots: '1-2-4', character: '⠋' },
  '7': { unicode: 'U+281B', dots: '1-2-4-5', character: '⠛' },
  '8': { unicode: 'U+2813', dots: '1-2-5', character: '⠓' },
  '9': { unicode: 'U+280A', dots: '2-4', character: '⠊' },
  '0': { unicode: 'U+281A', dots: '2-4-5', character: '⠚' },
  '.': { unicode: 'U+2832', dots: '2-5-6', character: '⠲' },
  ',': { unicode: 'U+2802', dots: '2', character: '⠂' },
  ';': { unicode: 'U+2806', dots: '2-3', character: '⠆' },
  ':': { unicode: 'U+2812', dots: '2-5', character: '⠒' },
  '!': { unicode: 'U+2816', dots: '2-3-5', character: '⠖' },
  '?': { unicode: 'U+2826', dots: '2-3-6', character: '⠦' },
  "'": { unicode: 'U+2804', dots: '3', character: '⠄' },
  '-': { unicode: 'U+2824', dots: '3-6', character: '⠤' },
  '(': { unicode: 'U+2828', dots: '4-6', character: '⠨' },
  ')': { unicode: 'U+2838', dots: '4-5-6', character: '⠸' },
  '"': { unicode: 'U+2810', dots: '5', character: '⠐' },
  '/': { unicode: 'U+282C', dots: '3-4-6', character: '⠬' },
  ' ': { unicode: 'U+2800', dots: '', character: '⠀' },
};

export const braillify = (text: string): string =>
  text
    .split('')
    .map((ch) => BRAILLE_MAP[ch.toLowerCase()]?.character ?? ch)
    .join('');

export const applyBraille = (doc: string, start: number, end: number): SelectionEdit => {
  const hasSelection = start !== end;
  const targetStart = hasSelection ? start : 0;
  const targetEnd = hasSelection ? end : doc.length;
  const converted = braillify(doc.slice(targetStart, targetEnd));

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

export const applyBrailleNodes = (root: HTMLElement): void => {
  walkTextNodes(root, braillify);
};

export const downloadBrf = (text: string) => {
  const out = braillify(text);
  const charsPerLine = 40;
  const lines: string[] = [];
  for (let i = 0; i < out.length; i += charsPerLine) lines.push(out.slice(i, i + charsPerLine));
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.brf';
  a.click();
  URL.revokeObjectURL(url);
};
