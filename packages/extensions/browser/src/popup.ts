import { createLogger } from './utils/log';
import { BACK_TO_TOP_KEY } from './lib/backtotop';
import { GET_SHOPIFY_ACTION, GET_SHOPIFY_STATE_ACTION } from './lib/shopify';
import {
  CLAUDE_KEY,
  CLAUDE_STORAGE_KEY,
  claudeColor,
  claudePercent,
  formatReset,
  type ClaudeLimitData,
} from './lib/claude';
import {
  GET_SOUND_STATE_ACTION,
  SOUND_MUTE_ALL_ACTION,
  SOUND_MUTE_OTHERS_ACTION,
  SOUND_MUTE_TAB_ACTION,
  SOUND_STATE_CHANGED_ACTION,
  type SoundState,
  type SoundTabInfo,
} from './lib/sounds';

const log = createLogger('Shopify:');
const soundLog = createLogger('Sound:');

const captureViewBtn = document.getElementById(
  'captureViewBtn'
) as HTMLButtonElement;
const captureFullBtn = document.getElementById(
  'captureFullBtn'
) as HTMLButtonElement;
const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
const previewWrap = document.getElementById('previewWrap');
const previewImg = document.getElementById('previewImg') as HTMLImageElement;
const previewSize = document.getElementById('previewSize');
const statusEl = document.getElementById('status');
const autoDownload = document.getElementById(
  'autoDownload'
) as HTMLInputElement;
const formatSelect = document.getElementById(
  'formatSelect'
) as HTMLSelectElement;
const tabUrlEl = document.getElementById('tabUrl');
const newTabRedirect = document.getElementById(
  'newTabRedirect'
) as HTMLInputElement;
const blockDistractingSites = document.getElementById(
  'blockDistractingSites'
) as HTMLInputElement;
const blockAds = document.getElementById('blockAds') as HTMLInputElement;
const backToTop = document.getElementById('backToTop') as HTMLInputElement;
const newTabTargetUrl = document.getElementById(
  'newTabTargetUrl'
) as HTMLInputElement;
const tabButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('.tab-btn')
);
const panes = Array.from(document.querySelectorAll<HTMLElement>('.pane'));
const instaTabBtn =
  document.querySelector<HTMLButtonElement>('[data-tab="insta"]');
const instaToggle = document.getElementById('instaToggle') as HTMLInputElement;
const chessTabBtn =
  document.querySelector<HTMLButtonElement>('[data-tab="chess"]');
const chessToggle = document.getElementById('chessFocus') as HTMLInputElement;
const claudeTabBtn = document.querySelector<HTMLButtonElement>(
  '[data-tab="claude"]'
);
const claudeUsage = document.getElementById('claudeUsage') as HTMLInputElement;
const claudeDaily = document.getElementById('claudeDaily');
const claudeWeekly = document.getElementById('claudeWeekly');
const claudeDailyReset = document.getElementById('claudeDailyReset');
const claudeWeeklyReset = document.getElementById('claudeWeeklyReset');
const githubTabBtn = document.querySelector<HTMLButtonElement>(
  '[data-tab="github"]'
);
const githubToggle = document.getElementById(
  'githubToggle'
) as HTMLInputElement;
const shopifyTabBtn = document.querySelector<HTMLButtonElement>(
  '[data-tab="shopify"]'
);
const shopifyCheckBtn = document.getElementById(
  'shopifyCheckBtn'
) as HTMLButtonElement;
const shopifyVerdict = document.getElementById('shopifyVerdict');
const shopifyIndicators = document.getElementById('shopifyIndicators');
const shopifyPlusIndicators = document.getElementById('shopifyPlusIndicators');
const soundTabList = document.getElementById('soundTabList');
const soundPlayingCount = document.getElementById('soundPlayingCount');
const soundMuteAllBtn = document.getElementById(
  'soundMuteAllBtn'
) as HTMLButtonElement;
const soundMuteOthersBtn = document.getElementById(
  'soundMuteOthersBtn'
) as HTMLButtonElement;

interface ShopifyIndicatorSet {
  windowShopify: boolean;
  shopifyMeta: boolean;
  shopifyCDN: boolean;
  cartJS: boolean;
}

interface ShopifyPlusIndicatorSet {
  checkoutDomain: boolean;
  checkoutObject: boolean;
  digitalWalletMeta: boolean;
}

interface ShopifyDetectionResult {
  isShopify: boolean;
  isShopifyPlus: boolean;
  indicators: ShopifyIndicatorSet;
  plusIndicators: ShopifyPlusIndicatorSet;
}

const DEFAULT_TARGET_URL = 'https://hieudoanm.github.io';
const TARGET_URL_KEY = 'newTabTargetUrl';
let savedTargetUrl = DEFAULT_TARGET_URL;

let lastDataUrl: string | null = null;
let lastFilename: string | null = null;
let isBusy = false;

const matchesHost = (value: string, domain: string): boolean => {
  try {
    const hostname = new URL(value).hostname.replace(/^www\./i, '');
    return hostname === domain || hostname.endsWith(`.${domain}`);
  } catch {
    return false;
  }
};

const isInstagramUrl = (value: string): boolean =>
  matchesHost(value, 'instagram.com');
const isGitHubUrl = (value: string): boolean =>
  matchesHost(value, 'github.com');
const isChessUrl = (value: string): boolean => matchesHost(value, 'chess.com');
const isClaudeUrl = (value: string): boolean => matchesHost(value, 'claude.ai');

const SHOPIFY_STATE_TIMEOUT_MS = 600;

const getShopifyState = (
  tabId: number
): Promise<ShopifyDetectionResult | undefined> =>
  Promise.race([
    chrome.runtime
      .sendMessage({ action: GET_SHOPIFY_STATE_ACTION, tabId })
      .then(
        (res) =>
          res?.isShopify === true ? (res as ShopifyDetectionResult) : undefined,
        () => undefined
      ),
    new Promise<undefined>((resolve) =>
      window.setTimeout(() => resolve(undefined), SHOPIFY_STATE_TIMEOUT_MS)
    ),
  ]);

const setupContextualTabs = (
  url: string | undefined,
  tabId: number | undefined
): void => {
  const onInstagram = url ? isInstagramUrl(url) : false;
  const onGitHub = url ? isGitHubUrl(url) : false;
  const onChess = url ? isChessUrl(url) : false;
  const onClaude = url ? isClaudeUrl(url) : false;

  instaTabBtn?.classList.toggle('hidden', !onInstagram);
  githubTabBtn?.classList.toggle('hidden', !onGitHub);
  chessTabBtn?.classList.toggle('hidden', !onChess);
  claudeTabBtn?.classList.toggle('hidden', !onClaude);

  if (onInstagram) return void activateTab('insta');
  if (onGitHub) return void activateTab('github');
  if (onChess) return void activateTab('chess');
  if (onClaude) return void activateTab('claude');

  if (tabId == null) return;
  void getShopifyState(tabId).then((result) => {
    if (!result) return;
    shopifyTabBtn?.classList.remove('hidden');
    activateTab('shopify');
  });
};

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  const url = tab?.url;
  if (tabUrlEl) {
    if (url) {
      try {
        const parsed = new URL(url);
        tabUrlEl.textContent = `${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`;
      } catch {
        tabUrlEl.textContent = url;
      }
    }
  }
  setupContextualTabs(url, tab?.id);
});

const renderIndicators = (
  el: HTMLElement | null,
  indicators: ShopifyIndicatorSet | ShopifyPlusIndicatorSet
): void => {
  if (!el) return;
  el.replaceChildren();
  for (const [key, value] of Object.entries(indicators)) {
    const row = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = key;
    const state = document.createElement('span');
    state.classList.add(value ? 'on' : 'off');
    state.textContent = value ? 'yes' : 'no';
    row.append(label, state);
    el.append(row);
  }
};

const SHOPIFY_QUERY_TIMEOUT_MS = 1200;

const sendShopifyQuery = (
  tabId: number
): Promise<ShopifyDetectionResult | undefined> =>
  Promise.race([
    chrome.runtime.sendMessage({ action: GET_SHOPIFY_ACTION, tabId }).then(
      (res) => {
        log.debug('relay reply', res);
        return res?.isShopify !== undefined
          ? (res as ShopifyDetectionResult)
          : undefined;
      },
      (err) => {
        log.warn('relay send failed', err);
        return undefined;
      }
    ),
    new Promise<undefined>((resolve) =>
      window.setTimeout(() => resolve(undefined), SHOPIFY_QUERY_TIMEOUT_MS)
    ),
  ]);

const setShopifyVerdict = (message: string): void => {
  if (shopifyVerdict) shopifyVerdict.textContent = message;
};

const renderShopifyResult = (result: ShopifyDetectionResult): void => {
  log.info(
    `popup isShopify=${result.isShopify} isShopifyPlus=${result.isShopifyPlus}`
  );
  setShopifyVerdict(
    result.isShopify
      ? result.isShopifyPlus
        ? 'Shopify Plus store'
        : 'Shopify store'
      : 'Not a Shopify store'
  );
  renderIndicators(shopifyIndicators, result.indicators);
  renderIndicators(shopifyPlusIndicators, result.plusIndicators);
};

const sleep = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const MAX_SHOPIFY_ATTEMPTS = 2;

const runShopifyCheck = async (tabId: number): Promise<void> => {
  setShopifyVerdict('Checking…');
  shopifyCheckBtn.disabled = true;
  try {
    for (let attempt = 0; attempt < MAX_SHOPIFY_ATTEMPTS; attempt++) {
      const result = await sendShopifyQuery(tabId);
      if (result !== undefined) {
        renderShopifyResult(result);
        return;
      }
      if (attempt < MAX_SHOPIFY_ATTEMPTS - 1) {
        log.warn(`no reply on attempt ${attempt + 1}, retrying`);
        await sleep(250);
      }
    }
    setShopifyVerdict('Not responding — refresh the page');
    log.warn(
      'no reply; the content script may not be loaded — refresh the page'
    );
  } finally {
    shopifyCheckBtn.disabled = false;
  }
};

shopifyCheckBtn?.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab?.id == null) {
      setShopifyVerdict('No active tab');
      return;
    }
    void runShopifyCheck(tab.id);
  });
});

chrome.storage.sync.get('redirectNewTabs', (result) => {
  if (chrome.runtime.lastError) return;
  if (newTabRedirect) {
    newTabRedirect.checked = result.redirectNewTabs !== false;
  }
});

newTabRedirect?.addEventListener('change', () => {
  chrome.storage.sync.set({ redirectNewTabs: newTabRedirect.checked });
});

chrome.storage.sync.get('blockDistractingSites', (result) => {
  if (chrome.runtime.lastError) return;
  if (blockDistractingSites) {
    blockDistractingSites.checked = result.blockDistractingSites !== false;
  }
});

blockDistractingSites?.addEventListener('change', () => {
  chrome.storage.sync.set({
    blockDistractingSites: blockDistractingSites.checked,
  });
});

chrome.storage.sync.get('blockAds', (result) => {
  if (chrome.runtime.lastError) return;
  if (blockAds) {
    blockAds.checked = result.blockAds !== false;
  }
});

blockAds?.addEventListener('change', () => {
  chrome.storage.sync.set({
    blockAds: blockAds.checked,
  });
});

chrome.storage.sync.get(BACK_TO_TOP_KEY, (result) => {
  if (chrome.runtime.lastError) return;
  if (backToTop) {
    backToTop.checked = result[BACK_TO_TOP_KEY] !== false;
  }
});

backToTop?.addEventListener('change', () => {
  chrome.storage.sync.set({ [BACK_TO_TOP_KEY]: backToTop.checked });
});

chrome.storage.sync.get('instaGesture', (result) => {
  if (chrome.runtime.lastError) return;
  if (instaToggle) {
    instaToggle.checked = result.instaGesture !== false;
  }
});

instaToggle?.addEventListener('change', () => {
  chrome.storage.sync.set({ instaGesture: instaToggle.checked });
});

chrome.storage.sync.get('githubExternalLinks', (result) => {
  if (chrome.runtime.lastError) return;
  if (githubToggle) {
    githubToggle.checked = result.githubExternalLinks !== false;
  }
});

githubToggle?.addEventListener('change', () => {
  chrome.storage.sync.set({ githubExternalLinks: githubToggle.checked });
});

chrome.storage.sync.get('chessFocus', (result) => {
  if (chrome.runtime.lastError) return;
  if (chessToggle) {
    chessToggle.checked = result.chessFocus !== false;
  }
});

chessToggle?.addEventListener('change', () => {
  chrome.storage.sync.set({ chessFocus: chessToggle.checked });
});

const renderClaudeColumn = (
  valueEl: HTMLElement | null,
  resetEl: HTMLElement | null,
  pct: number | null,
  resetAt: number | null
): void => {
  if (!valueEl) return;
  if (pct === null) {
    valueEl.textContent = '—';
    valueEl.style.color = '';
    if (resetEl) resetEl.textContent = '';
    return;
  }
  valueEl.textContent = `${pct}%`;
  valueEl.style.color = claudeColor(pct);
  if (resetEl) resetEl.textContent = `\u21bb ${formatReset(resetAt)}`;
};

const renderClaudeUsage = (data: ClaudeLimitData | undefined): void => {
  const pct = data ? claudePercent(data) : { daily: null, weekly: null };
  renderClaudeColumn(
    claudeDaily,
    claudeDailyReset,
    pct.daily,
    data?.daily.resetAt ?? null
  );
  renderClaudeColumn(
    claudeWeekly,
    claudeWeeklyReset,
    pct.weekly,
    data?.weekly.resetAt ?? null
  );
};

chrome.storage.local.get(CLAUDE_STORAGE_KEY, (result) => {
  if (chrome.runtime.lastError) return;
  renderClaudeUsage(result[CLAUDE_STORAGE_KEY] as ClaudeLimitData | undefined);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !(CLAUDE_STORAGE_KEY in changes)) return;
  renderClaudeUsage(
    changes[CLAUDE_STORAGE_KEY]?.newValue as ClaudeLimitData | undefined
  );
});

chrome.storage.sync.get(CLAUDE_KEY, (result) => {
  if (chrome.runtime.lastError) return;
  if (claudeUsage) claudeUsage.checked = result[CLAUDE_KEY] !== false;
});

claudeUsage?.addEventListener('change', () => {
  chrome.storage.sync.set({ [CLAUDE_KEY]: claudeUsage.checked });
});

let soundPanelActive = false;

const activateTab = (tabId: string): void => {
  tabButtons.forEach((btn) => {
    const active = btn.dataset.tab === tabId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  panes.forEach((pane) => {
    pane.classList.toggle('active', pane.id === `pane-${tabId}`);
  });
  soundPanelActive = tabId === 'sound';
  if (soundPanelActive) {
    startSoundPolling();
  } else {
    stopSoundPolling();
  }
};

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const dataTab = btn.dataset.tab;
    if (dataTab) activateTab(dataTab);
  });
});

const isValidTargetUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

chrome.storage.sync.get(TARGET_URL_KEY, (result) => {
  if (chrome.runtime.lastError) return;
  const value = result[TARGET_URL_KEY];
  savedTargetUrl =
    typeof value === 'string' && value.trim()
      ? value.trim()
      : DEFAULT_TARGET_URL;
  if (newTabTargetUrl) newTabTargetUrl.value = savedTargetUrl;
});

newTabTargetUrl?.addEventListener('change', () => {
  const raw = newTabTargetUrl.value.trim();
  if (!isValidTargetUrl(raw)) {
    newTabTargetUrl.value = savedTargetUrl;
    setStatus('Target must start with http:// or https://', 'err');
    return;
  }
  savedTargetUrl = raw;
  newTabTargetUrl.value = raw;
  chrome.storage.sync.set({ [TARGET_URL_KEY]: raw });
  setStatus('Target saved ✓', 'ok');
});

const setStatus = (msg: string, type = ''): void => {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = 'status' + (type ? ` ${type}` : '');
};

const bytesToSize = (base64: string): string => {
  const bytes = Math.round((base64.length * 3) / 4);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const getTimestamp = (): string => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
};

const setBusy = (busy: boolean): void => {
  isBusy = busy;
  captureViewBtn.disabled = busy;
  captureFullBtn.disabled = busy;
};

const SNAP_PING = 'SNAP_PING';
const CAPTURE_VIEW_TIMEOUT_MS = 20_000;
const CAPTURE_FULL_TIMEOUT_MS = 150_000;
const PING_TIMEOUT_MS = 2_000;

const withTimeout = <T>(
  promise: Promise<T>,
  ms: number
): Promise<T | undefined> =>
  Promise.race([
    promise,
    new Promise<undefined>((resolve) =>
      window.setTimeout(() => resolve(undefined), ms)
    ),
  ]);

const pingBackground = (): Promise<boolean> =>
  withTimeout(
    chrome.runtime.sendMessage({ action: SNAP_PING }),
    PING_TIMEOUT_MS
  )
    .then((reply) => (reply as { pong?: boolean } | undefined)?.pong === true)
    .catch((): false => {
      log.warn('background ping failed');
      return false;
    });

const capture = async (mode: 'view' | 'full'): Promise<void> => {
  if (isBusy) return;
  const format = formatSelect.value;
  const quality = format === 'png' ? undefined : 92;

  log.info('capture starting', { mode, format, quality });

  setBusy(true);
  setStatus(mode === 'full' ? 'Capturing full page...' : 'Capturing view...');
  previewWrap?.classList.remove('visible');
  lastDataUrl = null;

  try {
    const timeoutMs =
      mode === 'full' ? CAPTURE_FULL_TIMEOUT_MS : CAPTURE_VIEW_TIMEOUT_MS;
    let response: { dataUrl?: string; error?: string } | undefined;
    try {
      response = await withTimeout(
        chrome.runtime.sendMessage({
          action: mode === 'full' ? 'captureFullPage' : 'captureView',
          format,
          quality,
        }),
        timeoutMs
      );
    } catch (err: unknown) {
      const reason = (err as Error)?.message || String(err);
      log.error('capture sendMessage rejected', { mode, reason });
      setStatus(`Capture failed: ${reason}`, 'err');
      return;
    }

    log.info('capture reply received', {
      mode,
      hasDataUrl: typeof response?.dataUrl === 'string',
      error: response?.error,
    });

    if (!response?.dataUrl) {
      if (response?.error) {
        log.error('capture returned an error', { mode, error: response.error });
        setStatus(`Capture failed: ${response.error}`, 'err');
        return;
      }
      const backgroundAlive = await pingBackground();
      const detail = backgroundAlive
        ? 'background got the request but never replied (inspect the service worker console)'
        : 'extension background did not respond — reload the extension and retry';
      log.error('capture got no response', { mode, backgroundAlive });
      setStatus(`Capture failed: ${detail}`, 'err');
      return;
    }

    const dataUrl = response.dataUrl as string;
    lastDataUrl = dataUrl;
    lastFilename = `snapshot_${mode}_${getTimestamp()}.${format}`;

    previewImg.src = dataUrl;
    previewSize!.textContent = bytesToSize(dataUrl);
    previewWrap?.classList.add('visible');

    setStatus(
      mode === 'full' ? 'Full page captured' : 'Captured successfully',
      'ok'
    );

    if (autoDownload?.checked) {
      triggerDownload(dataUrl, lastFilename);
    }
  } finally {
    setBusy(false);
  }
};

const triggerDownload = (dataUrl: string, filename: string): void => {
  chrome.downloads.download({ url: dataUrl, filename, saveAs: false }, () => {
    if (chrome.runtime.lastError) {
      setStatus('Download error: ' + chrome.runtime.lastError.message, 'err');
    } else {
      setStatus('Saved to downloads ✓', 'ok');
    }
  });
};

captureViewBtn.addEventListener('click', () => {
  void capture('view');
});

captureFullBtn.addEventListener('click', () => {
  void capture('full');
});

downloadBtn.addEventListener('click', () => {
  if (!lastDataUrl) return;
  triggerDownload(lastDataUrl, lastFilename ?? '');
});

copyBtn.addEventListener('click', async () => {
  if (!lastDataUrl) return;
  try {
    const res = await fetch(lastDataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    setStatus('Copied to clipboard ✓', 'ok');
  } catch {
    setStatus('Copy not supported in this context.', 'err');
  }
});

const renderSoundState = (state: SoundState): void => {
  const tabs = state.tabs;
  if (soundPlayingCount) {
    const playing = tabs.filter((tab) => tab.audible && !tab.muted).length;
    soundPlayingCount.textContent = `${playing} playing`;
  }
  if (!soundTabList) return;
  soundTabList.replaceChildren();
  if (tabs.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'sound-empty';
    empty.textContent = 'No tabs';
    soundTabList.append(empty);
    return;
  }
  for (const tab of tabs) {
    soundTabList.append(buildSoundRow(tab));
  }
};

const buildSoundRow = (tab: SoundTabInfo): HTMLLIElement => {
  const row = document.createElement('li');
  row.className =
    'sound-row' + (tab.audible ? ' audible' : '') + (tab.muted ? ' muted' : '');

  const favicon = document.createElement('img');
  favicon.className = 'sound-favicon';
  favicon.alt = '';
  if (tab.favIconUrl) favicon.src = tab.favIconUrl;

  const info = document.createElement('div');
  info.className = 'sound-info';
  const title = document.createElement('div');
  title.className = 'sound-title';
  title.textContent = tab.title || 'Untitled';
  const meta = document.createElement('div');
  meta.className = 'sound-meta';
  meta.textContent = tab.audible ? '♪ playing' : tab.hostname || '—';
  info.append(title, meta);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'btn-secondary sound-toggle';
  toggle.textContent = tab.muted ? 'Unmute' : 'Mute';
  toggle.addEventListener('click', () => {
    void sendSoundAction({
      action: SOUND_MUTE_TAB_ACTION,
      tabId: tab.tabId,
      muted: !tab.muted,
    });
  });

  row.append(favicon, info, toggle);
  return row;
};

const soundStateKey = (state: SoundState): string =>
  state.tabs
    .map(
      (tab) =>
        `${tab.tabId}:${tab.audible ? 'a' : '-'}:${tab.muted ? 'm' : '-'}`
    )
    .join('|');

let renderedSoundKey = '';

const applySoundReply = (reply: unknown): void => {
  const state = reply as SoundState | undefined;
  if (!state?.tabs) return;
  const key = soundStateKey(state);
  if (key === renderedSoundKey) return;
  renderedSoundKey = key;
  renderSoundState(state);
};

const sendSoundAction = (payload: unknown): void => {
  chrome.runtime.sendMessage(payload, (reply) => {
    if (chrome.runtime.lastError) {
      soundLog.debug(
        'sendMessage lastError:',
        chrome.runtime.lastError.message
      );
      void chrome.runtime.lastError;
      return;
    }
    soundLog.debug('reply received');
    applySoundReply(reply);
  });
};

const SOUND_REFRESH_MS = 1500;

let soundPollTimer: number | null = null;

const startSoundPolling = (): void => {
  if (soundPollTimer != null) return;
  soundPollTimer = window.setInterval(() => {
    sendSoundAction({ action: GET_SOUND_STATE_ACTION });
  }, SOUND_REFRESH_MS);
};

const stopSoundPolling = (): void => {
  if (soundPollTimer == null) return;
  window.clearInterval(soundPollTimer);
  soundPollTimer = null;
};

document.addEventListener('visibilitychange', () => {
  soundLog.debug('visibility change →', document.visibilityState);
  if (document.visibilityState === 'hidden') {
    stopSoundPolling();
  } else if (soundPanelActive) {
    startSoundPolling();
  }
});

soundMuteAllBtn?.addEventListener('click', () => {
  void sendSoundAction({ action: SOUND_MUTE_ALL_ACTION, muted: true });
});

soundMuteOthersBtn?.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab?.id == null) return;
    void sendSoundAction({ action: SOUND_MUTE_OTHERS_ACTION, tabId: tab.id });
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.action !== SOUND_STATE_CHANGED_ACTION) return;
  applySoundReply(message.state);
});

// Polling starts only when the Sound tab is opened (see `activateTab`); the
// push-based `SOUND_STATE_CHANGED_ACTION` keeps the list live whenever the
// popup is open.
soundLog.debug('popup ready, visibility', document.visibilityState);
sendSoundAction({ action: GET_SOUND_STATE_ACTION });
