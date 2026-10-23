import { onNextFrame } from '../utils/frame';
import { createLogger } from '../utils/log';

export const BACK_TO_TOP_KEY = 'backToTop';

const log = createLogger('BackToTop:');

let backToTopEnabled = true;

void chrome.storage.sync.get(BACK_TO_TOP_KEY, (result) => {
  backToTopEnabled = result[BACK_TO_TOP_KEY] !== false;
  log.info(`back to top enabled=${backToTopEnabled}`);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && BACK_TO_TOP_KEY in changes) {
    backToTopEnabled = changes[BACK_TO_TOP_KEY]?.newValue !== false;
    log.info(`toggle changed -> enabled=${backToTopEnabled}`);
    if (!backToTopEnabled) {
      removeButton();
    }
  }
});

const BUTTON_ID = 'omni-back-to-top-btn';
const SCROLL_THRESHOLD = 300;

let button: HTMLElement | null = null;
let scrollListenerAttached = false;

const createButton = (): void => {
  if (button) return;

  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.textContent = 'Back to Top';
  btn.setAttribute('aria-label', 'Scroll to top of page');

  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 16px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: '2147483647',
    opacity: '0',
    visibility: 'hidden',
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  });

  btn.addEventListener('click', () => {
    log.info('scrolling to top');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.body.appendChild(btn);
  button = btn;
  log.debug('button created');
};

const removeButton = (): void => {
  if (button) {
    button.remove();
    button = null;
    log.debug('button removed');
  }
};

const showButton = (): void => {
  if (button) {
    button.style.opacity = '1';
    button.style.visibility = 'visible';
  }
};

const hideButton = (): void => {
  if (button) {
    button.style.opacity = '0';
    button.style.visibility = 'hidden';
  }
};

const handleScroll = (): void => {
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  if (scrollY > SCROLL_THRESHOLD) {
    showButton();
  } else {
    hideButton();
  }
};

const attachScrollListener = (): void => {
  if (scrollListenerAttached) return;

  window.addEventListener(
    'scroll',
    () => {
      onNextFrame(handleScroll);
    },
    { passive: true }
  );

  scrollListenerAttached = true;
  log.debug('scroll listener attached');
};

const isScrollablePage = (): boolean => {
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;
  return scrollHeight > clientHeight;
};

const start = (): void => {
  if (!isScrollablePage()) {
    log.debug('page not scrollable, skipping button');
    return;
  }

  createButton();
  attachScrollListener();
  handleScroll();
  log.debug('back to top feature started');
};

export const registerBackToTop = (): void => {
  if (!backToTopEnabled) {
    log.debug('back to top disabled, skipping registration');
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
};
