import { AD_NETWORK_DOMAINS, ADS_KEY } from './lib/ads';
import { SOUND_AUDIBLE_ACTION } from './lib/audio';
import {
  CLAUDE_RESULT_ACTION,
  CLAUDE_STORAGE_KEY,
  claudeColor,
  claudePercent,
  type ClaudeLimitData,
} from './lib/claude';
import { registerNewTabRedirect } from './lib/newtab';
import {
  GET_SHOPIFY_ACTION,
  GET_SHOPIFY_STATE_ACTION,
  SHOPIFY_RESULT_ACTION,
  type ShopifyDetectionResult,
} from './lib/shopify';
import { stitchChunks, type SnapshotChunk } from './lib/snapshot';
import {
  GET_SOUND_STATE_ACTION,
  SOUND_MUTE_ALL_ACTION,
  SOUND_MUTE_OTHERS_ACTION,
  SOUND_MUTE_TAB_ACTION,
  SOUND_STATE_CHANGED_ACTION,
  SoundTabInfo,
  toSoundTabInfo,
  type SoundState,
} from './lib/sounds';
import { createLogger } from './utils/log';

type BadgeAction = {
  setBadgeText: (details: { text: string; tabId?: number }) => void;
  setBadgeBackgroundColor: (details: { color: string; tabId?: number }) => void;
};

const chromeApi = chrome as unknown as Record<string, BadgeAction | undefined>;
const badgeAction = chromeApi.action ?? chromeApi.browserAction;

const log = createLogger('Shopify:');
const soundLog = createLogger('Sound:');
const appLog = createLogger('Tabs:');

interface CaptureRequest {
  action: string;
  format: string;
  quality?: number;
}

interface LayoutInfo {
  scrollHeight: number;
  clientHeight: number;
  scrollY: number;
  dpr: number;
}

const SNAP = 'SNAP_';
const SETTLE_EXTRA_MS = 80;
const ADS_RULESET_ID = 'ruleset_block';

const SNAP_ACTIONS = new Set(['captureView', 'captureFullPage']);
const SNAP_PING = 'SNAP_PING';
const CAPTURE_HARD_TIMEOUT_MS = 150_000;

const withHardTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_resolve, reject) =>
      window.setTimeout(
        () => reject(new Error(`Snapshot: ${label} timed out after ${ms} ms`)),
        ms
      )
    ),
  ]);

const shopifyResults = new Map<number, ShopifyDetectionResult>();
const contentAudibleTabs = new Set<number>();

let adsBlockEnabled = true;

void chrome.storage.sync.get(ADS_KEY, (result) => {
  adsBlockEnabled = result[ADS_KEY] !== false;
  applyNetworkBlockState();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && ADS_KEY in changes) {
    adsBlockEnabled = changes[ADS_KEY]?.newValue !== false;
    applyNetworkBlockState();
  }
});

const applyNetworkBlockState = (): void => {
  if (typeof chrome.declarativeNetRequest !== 'undefined') {
    void chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: adsBlockEnabled ? [ADS_RULESET_ID] : [],
      disableRulesetIds: adsBlockEnabled ? [] : [ADS_RULESET_ID],
    });
  }
};

if (typeof chrome.webRequest !== 'undefined') {
  chrome.webRequest.onBeforeRequest.addListener(
    () => (adsBlockEnabled ? { cancel: true } : {}),
    { urls: AD_NETWORK_DOMAINS },
    ['blocking']
  );
}

registerNewTabRedirect();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === SNAP_PING) {
    sendResponse({ pong: true, alarm: `${sender.tab?.url ?? 'no tab'}` });
    return;
  }
  if (SNAP_ACTIONS.has(message?.action)) {
    const request = message as CaptureRequest;
    appLog.info('capture requested', {
      action: request.action,
      format: request.format,
      quality: request.quality,
      tabId: sender.tab?.id,
      url: sender.tab?.url,
    });
    void withHardTimeout(
      handleCapture(request),
      CAPTURE_HARD_TIMEOUT_MS,
      'capture'
    )
      .then((dataUrl) => {
        appLog.info('capture succeeded', {
          action: request.action,
          dataUrlLength: dataUrl.length,
        });
        sendResponse({ dataUrl });
      })
      .catch((err: unknown) => {
        const error = err as Error;
        appLog.error('capture failed', {
          action: request.action,
          message: error?.message,
          stack: error?.stack,
        });
        sendResponse({ error: error?.message || 'Capture failed' });
      });
    return true;
  }

  if (message?.action === SHOPIFY_RESULT_ACTION) {
    const tabId = sender.tab?.id;
    const result = (message as { result?: ShopifyDetectionResult }).result;
    if (tabId == null || !result) return;
    if (result.isShopify) {
      shopifyResults.set(tabId, result);
      void chrome.action.setBadgeText({ tabId, text: 'S' });
    } else {
      shopifyResults.delete(tabId);
      void chrome.action.setBadgeText({ tabId, text: '' });
    }
    return;
  }

  if (message?.action === SOUND_AUDIBLE_ACTION) {
    const tabId = sender.tab?.id;
    if (tabId == null) return;
    const playing = (message as { playing?: unknown }).playing === true;
    if (playing) {
      contentAudibleTabs.add(tabId);
    } else {
      contentAudibleTabs.delete(tabId);
    }
    soundLog.info('content audible report', {
      tabId,
      playing,
      audibleTabs: contentAudibleTabs.size,
    });
    schedulePushSoundState();
    return;
  }

  if (message?.action === CLAUDE_RESULT_ACTION) {
    const tabId = sender.tab?.id;
    const result = (message as { result?: ClaudeLimitData | null }).result;
    if (tabId == null) return;
    if (result) {
      void chrome.storage.local.set({ [CLAUDE_STORAGE_KEY]: result });
      applyClaudeBadge(tabId, result);
    } else if (badgeAction) {
      badgeAction.setBadgeText({ tabId, text: '' });
    }
    return;
  }

  if (message?.action === GET_SHOPIFY_ACTION) {
    void handleShopifyCheck(message).then((result) => sendResponse(result));
    return true;
  }

  if (message?.action === GET_SHOPIFY_STATE_ACTION) {
    void handleShopifyState(message).then((result) => sendResponse(result));
    return true;
  }

  if (message?.action === GET_SOUND_STATE_ACTION) {
    return collectSoundState();
  }

  if (message?.action === SOUND_MUTE_TAB_ACTION) {
    return handleMuteTab(message);
  }

  if (message?.action === SOUND_MUTE_ALL_ACTION) {
    return handleMuteAll(message);
  }

  if (message?.action === SOUND_MUTE_OTHERS_ACTION) {
    return handleMuteOthers(message);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  shopifyResults.delete(tabId);
  contentAudibleTabs.delete(tabId);
  void chrome.action.setBadgeText({ tabId, text: '' });
  schedulePushSoundState();
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.audible !== undefined || changeInfo.mutedInfo !== undefined) {
    schedulePushSoundState();
  }
});

let soundPushTimer: number | undefined;

const schedulePushSoundState = (): void => {
  if (soundPushTimer !== undefined) return;
  soundPushTimer = window.setTimeout(() => {
    soundPushTimer = undefined;
    void pushSoundState();
  }, 300);
};

const applyClaudeBadge = (tabId: number, data: ClaudeLimitData): void => {
  if (!badgeAction) return;
  const { daily, weekly } = claudePercent(data);
  if (daily === null && weekly === null) {
    badgeAction.setBadgeText({ tabId, text: '' });
    return;
  }
  const pct = Math.max(daily ?? 0, weekly ?? 0);
  badgeAction.setBadgeText({ tabId, text: `${pct}%` });
  badgeAction.setBadgeBackgroundColor({ tabId, color: claudeColor(pct) });
};

const queryTabs = (
  queryInfo: chrome.tabs.QueryInfo = {}
): Promise<chrome.tabs.Tab[]> =>
  new Promise((resolve) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      if (chrome.runtime.lastError) {
        resolve([]);
        return;
      }
      resolve(tabs);
    });
  });

const collectSoundState = async (): Promise<SoundState> => {
  const tabs = await queryTabs();
  const tabsInfo: SoundTabInfo[] = [];
  for (const tab of tabs) {
    const info = toSoundTabInfo(tab);
    if (!info) continue;
    info.audible = info.audible || contentAudibleTabs.has(info.tabId);
    soundLog.info('sound merged audible', {
      tabId: info.tabId,
      audible: info.audible,
      contentReported: contentAudibleTabs.has(info.tabId),
    });
    tabsInfo.push(info);
  }
  return { tabs: tabsInfo };
};

const pushSoundState = async (): Promise<void> => {
  try {
    const state = await collectSoundState();
    await chrome.runtime.sendMessage({
      action: SOUND_STATE_CHANGED_ACTION,
      state,
    });
  } catch {
    soundLog.debug('no popup listening for sound state');
  }
};

const handleMuteTab = async (message: {
  action: string;
  tabId?: number;
  muted?: boolean;
}): Promise<SoundState> => {
  if (typeof message.tabId === 'number' && typeof message.muted === 'boolean') {
    await chrome.tabs.update(message.tabId, { muted: message.muted });
    soundLog.info(`muted=${message.muted} tabId=${message.tabId}`);
  }
  return collectSoundState();
};

const handleMuteAll = async (message: {
  action: string;
  muted?: boolean;
}): Promise<SoundState> => {
  const muted = message.muted === true;
  const tabs = await queryTabs();
  const updates = tabs
    .filter(
      (tab) => tab.id != null && (tab.mutedInfo?.muted ?? false) !== muted
    )
    .map((tab) => chrome.tabs.update(tab.id!, { muted }));
  await Promise.all(updates);
  soundLog.info(`muteAll=${muted} tabs=${tabs.length}`);
  return collectSoundState();
};

const handleMuteOthers = async (message: {
  action: string;
  tabId?: number;
}): Promise<SoundState> => {
  const keepId = message.tabId;
  const tabs = await queryTabs();
  const updates = tabs
    .filter(
      (tab) => tab.id != null && tab.id !== keepId && !tab.mutedInfo?.muted
    )
    .map((tab) => chrome.tabs.update(tab.id!, { muted: true }));
  await Promise.all(updates);
  soundLog.info(`muteOthers keep=${keepId} tabs=${tabs.length}`);
  return collectSoundState();
};

const handleCapture = async (request: CaptureRequest): Promise<string> =>
  request.action === 'captureFullPage'
    ? handleCaptureFullPage(request)
    : handleCaptureView(request);

const handleShopifyState = async (message: {
  tabId?: number;
}): Promise<ShopifyDetectionResult | undefined> => {
  if (typeof message.tabId !== 'number') return undefined;
  return shopifyResults.get(message.tabId);
};

const handleShopifyCheck = async (message: {
  action: string;
  tabId?: number;
}): Promise<ShopifyDetectionResult | { error: string }> => {
  const tabId =
    typeof message.tabId === 'number'
      ? message.tabId
      : await getActiveTabId().catch(() => null);
  if (tabId == null) {
    return { error: 'Snapshot: no active tab' };
  }

  const cached = shopifyResults.get(tabId);
  if (cached) return cached;

  if (typeof chrome.scripting?.executeScript === 'function') {
    try {
      const result = await runScriptInPage(tabId);
      if (result && typeof result.isShopify === 'boolean') {
        if (result.isShopify) {
          shopifyResults.set(tabId, result);
          void chrome.action.setBadgeText({ tabId, text: 'S' });
        } else {
          void chrome.action.setBadgeText({ tabId, text: '' });
        }
        return result;
      }
    } catch (err) {
      log.warn('executeScript in page failed:', err);
    }
  }

  return { error: 'Shopify check timed out' };
};

const runScriptInPage = (
  tabId: number
): Promise<ShopifyDetectionResult | undefined> =>
  new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        world: 'MAIN',
        func: detectShopifyInPage,
      },
      (injections) => {
        if (chrome.runtime.lastError || !injections?.length) {
          resolve(undefined);
          return;
        }
        resolve(injections[0]?.result as ShopifyDetectionResult | undefined);
      }
    );
  });

const detectShopifyInPage = (): {
  isShopify: boolean;
  isShopifyPlus: boolean;
  indicators: Record<string, boolean>;
  plusIndicators: Record<string, boolean>;
} => {
  const shopify = (window as { Shopify?: { checkout?: unknown } }).Shopify;
  const scriptSrcs = Array.from(document.scripts).map((script) => script.src);
  const indicators = {
    windowShopify: typeof shopify !== 'undefined',
    shopifyMeta: !!document.querySelector(
      'meta[name="shopify-checkout-api-token"]'
    ),
    shopifyCDN: scriptSrcs.some((src) => src.includes('cdn.shopify.com')),
    cartJS: scriptSrcs.some((src) => src.includes('/cart.js')),
  };
  const plusIndicators = {
    checkoutDomain: location.hostname.includes('checkout.shopify'),
    checkoutObject: typeof shopify?.checkout !== 'undefined',
    digitalWalletMeta: !!document.querySelector(
      'meta[name="shopify-digital-wallet"]'
    ),
  };
  const isShopify = Object.values(indicators).some(Boolean);
  return {
    isShopify,
    isShopifyPlus: isShopify && Object.values(plusIndicators).some(Boolean),
    indicators,
    plusIndicators,
  };
};

const handleCaptureView = async (request: CaptureRequest): Promise<string> => {
  const captureOptions = buildCaptureOptions(request);
  appLog.info('captureView options', {
    format: captureOptions.format,
    quality: captureOptions.quality,
  });
  const dataUrl = await captureVisibleTab(captureOptions);
  if (request.format !== 'png' && request.format !== 'jpeg') {
    return reencode(dataUrl, request.format, request.quality ?? 92);
  }
  return dataUrl;
};

const handleCaptureFullPage = async (
  request: CaptureRequest
): Promise<string> => {
  const tabId = await getActiveTabId();
  const layout = await sendToContent<LayoutInfo>(tabId, {
    action: `${SNAP}GET_LAYOUT`,
  });
  if (!layout) {
    throw new Error(
      'Snapshot: content script did not respond (is the page fully loaded?)'
    );
  }
  if (layout.scrollHeight <= 0) {
    throw new Error('Snapshot: no page to capture');
  }

  const dpr = layout.dpr || 1;
  const chunkCount = Math.ceil(layout.scrollHeight / layout.clientHeight);
  appLog.info('full-page layout', {
    tabId,
    scrollHeight: layout.scrollHeight,
    clientHeight: layout.clientHeight,
    scrollY: layout.scrollY,
    dpr,
    chunkCount,
  });

  const chunks: SnapshotChunk[] = [];
  let widthPx = 0;

  for (let i = 0; i < chunkCount; i += 1) {
    const target = Math.min(
      i * layout.clientHeight,
      layout.scrollHeight - layout.clientHeight
    );
    const scroll = await sendToContent<{ scrollY: number }>(tabId, {
      action: `${SNAP}SCROLL_TO`,
      y: target,
    });
    await wait(SETTLE_EXTRA_MS);

    const dataUrl = await captureVisibleTab({ format: 'png' });
    const size = await getBitmapSize(dataUrl);
    widthPx = size.width;

    const y = Math.round((scroll?.scrollY ?? target) * dpr);
    chunks.push({ dataUrl, y });
    appLog.debug('full-page chunk captured', {
      index: i,
      target,
      capturedY: scroll?.scrollY,
      y,
      dataUrlLength: dataUrl.length,
    });
  }

  await sendToContent(tabId, { action: `${SNAP}SCROLL_TO`, y: 0 });

  const heightPx = Math.round(layout.scrollHeight * dpr);
  appLog.info('full-page stitching', {
    chunkCount: chunks.length,
    widthPx,
    heightPx,
  });
  const stitched = await stitchChunks(chunks, widthPx, heightPx);

  if (request.format === 'png') {
    return stitched;
  }
  return reencode(stitched, request.format ?? 'jpeg', request.quality ?? 92);
};

const buildCaptureOptions = (
  request: CaptureRequest
): {
  format: 'png' | 'jpeg';
  quality?: number;
} => {
  const format = request.format === 'png' ? 'png' : 'jpeg';
  const options: { format: 'png' | 'jpeg'; quality?: number } = { format };
  if (format === 'jpeg') {
    options.quality = request.quality || 92;
  }
  return options;
};

const captureVisibleTab = (options: {
  format: 'png' | 'jpeg';
  quality?: number;
}): Promise<string> =>
  new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(
      chrome.windows.WINDOW_ID_CURRENT,
      options,
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          const message = chrome.runtime.lastError.message;
          appLog.error('captureVisibleTab failed', { message, options });
          reject(new Error(`Snapshot: ${message}`));
          return;
        }
        resolve(dataUrl);
      }
    );
  });

const getActiveTabId = async (): Promise<number> => {
  const [tab] = await queryTabs({ active: true, currentWindow: true });
  if (!tab?.id) {
    appLog.error('no active tab for capture');
    throw new Error('Snapshot: no active tab');
  }
  return tab.id;
};

const sendToContent = <T>(
  tabId: number,
  message: unknown
): Promise<T | undefined> =>
  new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        const lastError = chrome.runtime.lastError.message;
        appLog.warn('sendToContent failed', {
          tabId,
          action: (message as { action?: string }).action,
          lastError,
        });
        resolve(undefined);
        return;
      }
      resolve(response as T);
    });
  });

const getBitmapSize = async (
  dataUrl: string
): Promise<{ width: number; height: number }> => {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    appLog.error('getBitmapSize fetch failed', {
      status: response.status,
      statusText: response.statusText,
    });
  }
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  return { width: bitmap.width, height: bitmap.height };
};

const reencode = async (
  dataUrl: string,
  format: string,
  quality: number
): Promise<string> => {
  const { width, height } = await getBitmapSize(dataUrl);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Snapshot: canvas unavailable');
  }
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  ctx.drawImage(bitmap, 0, 0);
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/webp';
  const out = await canvas.convertToBlob({
    type: mime,
    quality: quality / 100,
  });
  return blobToDataUrl(out);
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Snapshot: failed to read blob'));
    reader.readAsDataURL(blob);
  });

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

appLog.info('background ready');
