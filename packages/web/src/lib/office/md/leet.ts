export const LEET_MAP: Record<string, { symbol: string; description: string }> = {
  a: { symbol: '4', description: '4' },
  b: { symbol: '8', description: '8' },
  e: { symbol: '3', description: '3' },
  g: { symbol: '9', description: '9' },
  i: { symbol: '1', description: '1' },
  l: { symbol: '1', description: '1' },
  o: { symbol: '0', description: '0' },
  s: { symbol: '5', description: '5' },
  t: { symbol: '7', description: '7' },
  z: { symbol: '2', description: '2' },
};

export const leetify = (text: string): string =>
  text
    .split('')
    .map((ch) => LEET_MAP[ch.toLowerCase()]?.symbol ?? ch)
    .join('');

const walkTextNodes = (root: HTMLElement, fn: (text: string) => string): void => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (!node.parentElement) continue;
    if (node.parentElement.closest('code, pre, textarea')) continue;
    node.textContent = fn(node.textContent ?? '');
  }
};

export const applyLeetNodes = (root: HTMLElement): void => {
  walkTextNodes(root, leetify);
};
