import { onNextFrame } from '../utils/frame';

export const CHESS_KEY = 'chessFocus';

const HIDE_CLASSES = [
  'live-game-start-component',
  'live-game-over-component',
  'user-tagline-username',
  'user-tagline-rating',
  'user-rating',
] as const;

const HIDE_SELECTOR = HIDE_CLASSES.map((className) => `.${className}`).join(
  ', '
);

const hideRoots = (roots: readonly Element[]): void => {
  for (const root of roots) {
    if (root.matches(HIDE_SELECTOR)) {
      (root as HTMLElement).style.display = 'none';
    }
    const matches = root.querySelectorAll<HTMLElement>(HIDE_SELECTOR);
    for (const el of matches) el.style.display = 'none';
  }
};

const hideAll = (): void => {
  const matches = document.querySelectorAll<HTMLElement>(HIDE_SELECTOR);
  for (const el of matches) el.style.display = 'none';
};

const MutationObserverCtor =
  window.MutationObserver ||
  (window as unknown as { WebKitMutationObserver: typeof MutationObserver })
    .WebKitMutationObserver;

let observer: MutationObserver | null = null;
let scheduledHide = false;
let enabled = false;
const pendingRoots: Element[] = [];

const scheduleHide = (mutations: MutationRecord[]): void => {
  if (!enabled) return;
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) pendingRoots.push(node);
    }
  }
  if (pendingRoots.length === 0) return;
  if (scheduledHide) return;
  scheduledHide = true;
  onNextFrame(() => {
    scheduledHide = false;
    hideRoots(pendingRoots.splice(0));
  });
};

const observe = (): void => {
  if (observer !== null || !MutationObserverCtor) return;
  observer = new MutationObserverCtor(scheduleHide);
  observer.observe(document, { childList: true, subtree: true });
};

const start = (): void => {
  enabled = true;
  hideAll();
  observe();
};

const stop = (): void => {
  enabled = false;
  observer?.disconnect();
  observer = null;
  pendingRoots.length = 0;
};

const isChessFocusEnabled = (): Promise<boolean> =>
  new Promise((resolve) => {
    chrome.storage.sync.get(CHESS_KEY, (result) => {
      if (chrome.runtime.lastError) {
        resolve(true);
        return;
      }
      resolve(result[CHESS_KEY] !== false);
    });
  });

export const registerChessFocus = (): void => {
  const hostname = window.location.hostname
    .replace(/^www\./i, '')
    .toLowerCase();
  if (hostname !== 'chess.com' && !hostname.endsWith('.chess.com')) return;

  void isChessFocusEnabled().then((on) => {
    if (on) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
      } else {
        start();
      }
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || !(CHESS_KEY in changes)) return;
    const on = changes[CHESS_KEY]?.newValue !== false;
    if (on) {
      start();
    } else {
      stop();
    }
  });
};
