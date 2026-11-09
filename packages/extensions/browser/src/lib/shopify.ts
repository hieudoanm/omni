import { createLogger } from '../utils/log';

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

export interface ShopifyDetectionResult {
  isShopify: boolean;
  isShopifyPlus: boolean;
  indicators: ShopifyIndicatorSet;
  plusIndicators: ShopifyPlusIndicatorSet;
}

interface MainWorldProbeResult {
  windowShopify: boolean;
  checkoutObject: boolean;
}

export const SHOPIFY_RESULT_ACTION = 'SHOPIFY_RESULT';
export const GET_SHOPIFY_ACTION = 'GET_SHOPIFY';
export const GET_SHOPIFY_STATE_ACTION = 'GET_SHOPIFY_STATE';

const MAIN_WORLD_CHANNEL = 'TABS_SHOPIFY_CHECK';
const MAIN_WORLD_TIMEOUT_MS = 400;

const log = createLogger('Shopify:');

const MAIN_WORLD_PROBE = `(() => {
  if (window.__tabsShopifyHook) return;
  window.__tabsShopifyHook = true;
  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data?.channel !== '${MAIN_WORLD_CHANNEL}') return;
    const shopify = window.Shopify;
    window.postMessage(
      {
        channel: '${MAIN_WORLD_CHANNEL}',
        windowShopify: typeof shopify !== 'undefined',
        checkoutObject: typeof shopify?.checkout !== 'undefined',
      },
      '*'
    );
  });
})();`;

const getShopifyIndicators = (): ShopifyIndicatorSet => ({
  windowShopify:
    typeof (window as { Shopify?: unknown }).Shopify !== 'undefined',
  shopifyMeta: !!document.querySelector(
    'meta[name="shopify-checkout-api-token"]'
  ),
  shopifyCDN: Array.from(document.scripts).some((script) =>
    script.src.includes('cdn.shopify.com')
  ),
  cartJS: Array.from(document.scripts).some((script) =>
    script.src.includes('/cart.js')
  ),
});

const getShopifyPlusIndicators = (): ShopifyPlusIndicatorSet => {
  const shopify = (window as { Shopify?: { checkout?: unknown } }).Shopify;
  return {
    checkoutDomain: location.hostname.includes('checkout.shopify'),
    checkoutObject: typeof shopify?.checkout !== 'undefined',
    digitalWalletMeta: !!document.querySelector(
      'meta[name="shopify-digital-wallet"]'
    ),
  };
};

const injectMainWorldProbe = (): void => {
  if (document.documentElement === null) return;
  const existing = document.querySelector<HTMLScriptElement>('script[nonce]');
  const script = document.createElement('script');
  const nonce = existing?.nonce;
  if (nonce) script.setAttribute('nonce', nonce);
  script.textContent = MAIN_WORLD_PROBE;
  document.documentElement.appendChild(script);
  script.remove();
};

const injectWhenProbeReady = (): void => {
  const hasNoncedScript = document.querySelector('script[nonce]') !== null;
  if (hasNoncedScript || document.readyState !== 'loading') {
    injectMainWorldProbe();
    return;
  }
  document.addEventListener('DOMContentLoaded', () => injectMainWorldProbe(), {
    once: true,
  });
};

const queryMainWorld = (): Promise<MainWorldProbeResult> =>
  new Promise((resolve, reject) => {
    let timer = 0;
    const handler = (event: MessageEvent): void => {
      const data = event.data as {
        channel?: string;
        windowShopify?: boolean;
        checkoutObject?: boolean;
      } | null;
      if (event.source !== window || data?.channel !== MAIN_WORLD_CHANNEL) {
        return;
      }
      window.clearTimeout(timer);
      window.removeEventListener('message', handler);
      resolve({
        windowShopify: data.windowShopify === true,
        checkoutObject: data.checkoutObject === true,
      });
    };
    timer = window.setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error('Shopify: main-world probe timed out'));
    }, MAIN_WORLD_TIMEOUT_MS);
    window.addEventListener('message', handler);
    window.postMessage({ channel: MAIN_WORLD_CHANNEL }, '*');
  });

let cachedProbe: MainWorldProbeResult | null = null;

const buildResult = (
  mainWorld: MainWorldProbeResult | null
): ShopifyDetectionResult => {
  const indicators = getShopifyIndicators();
  const plusIndicators = getShopifyPlusIndicators();
  const resolvedIndicators: ShopifyIndicatorSet = {
    ...indicators,
    windowShopify:
      indicators.windowShopify || mainWorld?.windowShopify === true,
  };
  const resolvedPlusIndicators: ShopifyPlusIndicatorSet = {
    ...plusIndicators,
    checkoutObject:
      plusIndicators.checkoutObject || mainWorld?.checkoutObject === true,
  };
  const isShopify = Object.values(resolvedIndicators).some(Boolean);
  const isShopifyPlus =
    isShopify && Object.values(resolvedPlusIndicators).some(Boolean);
  return {
    isShopify,
    isShopifyPlus,
    indicators: resolvedIndicators,
    plusIndicators: resolvedPlusIndicators,
  };
};

const primeProbe = async (): Promise<void> => {
  try {
    cachedProbe = await queryMainWorld();
  } catch {
    cachedProbe = null;
  }
};

const reportShopifyResult = (): void => {
  const result = buildResult(cachedProbe);
  log.info(
    `isShopify=${result.isShopify} isShopifyPlus=${result.isShopifyPlus}`
  );
  try {
    chrome.runtime.sendMessage(
      { action: SHOPIFY_RESULT_ACTION, result },
      () => void chrome.runtime.lastError
    );
  } catch {
    // Extension context may be gone after navigation; ignore.
  }
};

const primeAndReport = (): void => {
  void primeProbe().then(reportShopifyResult);
};

const primeWhenProbeReady = (): void => {
  const hasNoncedScript = document.querySelector('script[nonce]') !== null;
  if (hasNoncedScript || document.readyState !== 'loading') {
    primeAndReport();
    return;
  }
  document.addEventListener('DOMContentLoaded', () => primeAndReport(), {
    once: true,
  });
};

const isWebProtocol = (): boolean => {
  const protocol = location.protocol;
  return protocol === 'http:' || protocol === 'https:';
};

let lastVisibilityReportAt = 0;
const VISIBILITY_REPORT_MIN_MS = 2000;

const bindReportTriggers = (): void => {
  window.addEventListener('load', () => {
    window.setTimeout(primeAndReport, 600);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    const now = Date.now();
    if (now - lastVisibilityReportAt < VISIBILITY_REPORT_MIN_MS) return;
    lastVisibilityReportAt = now;
    primeAndReport();
  });
};

export const registerShopifyDetection = (): void => {
  if (!isWebProtocol()) return;
  injectWhenProbeReady();
  primeWhenProbeReady();
  bindReportTriggers();
};
