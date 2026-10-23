import { createLogger } from '../utils/log';

export const GESTURE_KEY = 'instaGesture';

const CONTEXT_MENU_PAIR_MS = 500;

const log = createLogger('Insta:');

let gestureEnabled = true;

void chrome.storage.sync.get(GESTURE_KEY, (result) => {
  gestureEnabled = result[GESTURE_KEY] !== false;
  log.info(`gesture enabled=${gestureEnabled}`);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && GESTURE_KEY in changes) {
    gestureEnabled = changes[GESTURE_KEY]?.newValue !== false;
    log.info(`toggle changed -> enabled=${gestureEnabled}`);
  }
});

let lastGestureAt = 0;

const isInstagramHostname = (): boolean => {
  const hostname = location.hostname;
  return hostname === 'instagram.com' || hostname.endsWith('.instagram.com');
};

const collectImageSources = (target: Element): string[] => {
  const siblings = [...(target.parentElement?.children ?? [])].filter(
    (element) => element !== target
  );

  const images = [
    ...(target.matches('img') ? [target] : []),
    ...target.querySelectorAll('img'),
    ...siblings.flatMap((sibling) => [
      ...(sibling.matches('img') ? [sibling] : []),
      ...sibling.querySelectorAll('img'),
    ]),
  ];

  const sources = [
    ...new Set(
      images.map((img) => (img as HTMLImageElement).src).filter(Boolean)
    ),
  ];
  log.debug(
    `target=${target.tagName}, siblings=${siblings.length}, images=${images.length}, unique sources=${sources.length}`
  );
  return sources;
};

const openInNewTabs = (sources: string[]): void => {
  sources.forEach((src, index) => {
    log.debug(`opening ${index + 1}/${sources.length} ${src}`);
    const link = document.createElement('a');
    link.href = src;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
  log.info(`opened ${sources.length} tab(s)`);
};

export const registerInstaGesture = (): void => {
  if (!isInstagramHostname()) {
    log.debug('not on Instagram, skipping gesture registration');
    return;
  }
  log.debug('registering listeners');

  const handleRightButtonDown = (event: MouseEvent): void => {
    if (event.button !== 2 || !event.shiftKey) return;
    if (!gestureEnabled) {
      log.debug('gesture disabled, ignoring');
      return;
    }

    log.info('Shift+right mousedown, opening photos');
    const target = event.target;
    if (!(target instanceof Element)) {
      log.debug('no element under cursor, nothing to collect');
      return;
    }

    const sources = collectImageSources(target);
    if (sources.length === 0) {
      log.debug('no image sources found to open');
      return;
    }
    openInNewTabs(sources);
    lastGestureAt = Date.now();
  };

  const handleContextMenu = (event: MouseEvent): void => {
    if (Date.now() - lastGestureAt > CONTEXT_MENU_PAIR_MS) return;
    log.debug('suppressing context menu after gesture');
    event.preventDefault();
    event.stopPropagation();
  };

  document.addEventListener('mousedown', handleRightButtonDown);
  window.addEventListener('contextmenu', handleContextMenu, true);
};
