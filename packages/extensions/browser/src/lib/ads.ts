import { onNextFrame } from '../utils/frame';

export const ADS_KEY = 'blockAds';

// Explicit, real ad containers only. Deliberately avoid broad `[class*="ad-"]`
// / `[id*="ad-"]` substring selectors: they force the engine to scan every
// element's class/id, match lots of legit content (false positives), and are
// the primary source of extension-induced jank on dynamic pages.
const AD_SELECTORS = [
  '.adsbox',
  '.ad-placement',
  '.ad-placeholder',
  '.ad-container',
  '.advertisement',
  'ins.adsbygoogle',
  'a[href*="doubleclick.net"]',
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="googlesyndication"]',
];

export const AD_NETWORK_DOMAINS = [
  '*://*.doubleclick.net/*',
  '*://*.google-analytics.com/*',
  '*://*.googlesyndication.com/*',
  '*://*.adnxs.com/*',
  '*://*.outbrain.com/*',
  '*://*.taboola.com/*',
];

const AD_SELECTOR = AD_SELECTORS.join(', ');

const hiddenElements = new Map<
  HTMLElement,
  { value: string; priority: string }
>();

const hideElement = (el: HTMLElement): void => {
  if (!hiddenElements.has(el)) {
    hiddenElements.set(el, {
      value: el.style.getPropertyValue('display'),
      priority: el.style.getPropertyPriority('display'),
    });
  }
  if (el.style.display !== 'none') {
    el.style.setProperty('display', 'none', 'important');
  }
};

const scanDocument = (): void => {
  const elements = document.querySelectorAll<HTMLElement>(AD_SELECTOR);
  for (const el of elements) hideElement(el);
};

const scanRoots = (roots: readonly Element[]): void => {
  for (const root of roots) {
    if (root.matches(AD_SELECTOR)) hideElement(root as HTMLElement);
    const matches = root.querySelectorAll<HTMLElement>(AD_SELECTOR);
    for (const el of matches) hideElement(el);
  }
};

const collectAddedRoots = (
  mutations: readonly MutationRecord[],
  roots: Element[]
): void => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) roots.push(node);
    }
  }
};

let scheduled = false;
let pendingRoots: Element[] = [];

const flushPending = (): void => {
  scheduled = false;
  if (!adsEnabled) {
    pendingRoots = [];
    return;
  }
  const batch = pendingRoots;
  pendingRoots = [];
  scanRoots(batch);
};

const scheduleScan = (roots: readonly Element[]): void => {
  pendingRoots.push(...roots);
  if (scheduled) return;
  scheduled = true;
  onNextFrame(flushPending);
};

let adsEnabled = true;
let observer: MutationObserver | null = null;

const observe = (): void => {
  const target = document.documentElement ?? document.body;
  if (!target) {
    window.addEventListener('load', observe, { once: true });
    return;
  }

  scanDocument();

  observer = new MutationObserver((mutations) => {
    const roots: Element[] = [];
    collectAddedRoots(mutations, roots);
    if (roots.length > 0) scheduleScan(roots);
  });

  observer.observe(target, { childList: true, subtree: true });
};

const setAdsEnabled = (enabled: boolean): void => {
  adsEnabled = enabled;
  if (enabled) {
    if (!observer) observe();
    return;
  }
  observer?.disconnect();
  observer = null;
  for (const [el, prior] of hiddenElements) {
    if (prior.value) {
      el.style.setProperty('display', prior.value, prior.priority);
    } else {
      el.style.removeProperty('display');
    }
  }
  hiddenElements.clear();
};

export const maybeRunAdsBlocker = (): void => {
  chrome.storage.sync.get(ADS_KEY, (result) => {
    if (chrome.runtime.lastError) return;
    adsEnabled = result[ADS_KEY] !== false;
    if (adsEnabled) observe();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && ADS_KEY in changes) {
      setAdsEnabled(changes[ADS_KEY].newValue !== false);
    }
  });
};
