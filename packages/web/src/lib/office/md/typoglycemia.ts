import { type CaseKind } from '@/lib/office/md/textCase';

export const scrambleWord = (word: string): string => {
  if (word.length <= 3) return word;
  const first = word[0];
  const last = word[word.length - 1];
  const middle = word.slice(1, -1).split('');
  const shuffleTimes = Math.min(middle.length, 2 + Math.floor(Math.random() * 3));
  for (let n = 0; n < shuffleTimes; n++) {
    const i = Math.floor(Math.random() * middle.length);
    let j = Math.floor(Math.random() * middle.length);
    if (i === j) j = (j + 1) % middle.length;
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }
  if (middle.join('') === word.slice(1, -1) && middle.length > 1)
    [middle[0], middle[middle.length - 1]] = [middle[middle.length - 1], middle[0]];
  return first + middle.join('') + last;
};

export const scrambleText = (text: string): string => text.replace(/\b[a-zA-Z]+\b/g, scrambleWord);

export const scrambleNodes = (root: HTMLElement): void => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (!node.parentElement) continue;
    if (node.parentElement.closest('code, pre, textarea')) continue;
    node.textContent = scrambleText(node.textContent ?? '');
  }
};

const CASE_CONVERTERS: Record<CaseKind, (text: string) => string> = {
  upper: (t) => t.toUpperCase(),
  lower: (t) => t.toLowerCase(),
  title: (t) => t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  camel: (t) => t.replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase()),
  snake: (t) => t.replace(/\s+/g, '_').toLowerCase(),
  kebab: (t) => t.replace(/\s+/g, '-').toLowerCase(),
};

export const applyCaseNodes = (root: HTMLElement, kind: CaseKind): void => {
  const convert = CASE_CONVERTERS[kind];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (!node.parentElement) continue;
    if (node.parentElement.closest('code, pre, textarea')) continue;
    node.textContent = convert(node.textContent ?? '');
  }
};
