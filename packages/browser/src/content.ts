import { maybeRunAdsBlocker } from './lib/ads';
import { registerAudioDetection } from './lib/audio';
import { registerBackToTop } from './lib/backtotop';
import { maybeRenderBlockWall } from './lib/block';
import { registerChessFocus } from './lib/chess';
import { registerClaudeUsage } from './lib/claude';
import { registerExternalLinkRouting } from './lib/github';
import { registerInstaGesture } from './lib/insta';
import { registerShopifyDetection } from './lib/shopify';

interface LayoutInfo {
  scrollHeight: number;
  clientHeight: number;
  scrollY: number;
  dpr: number;
}

const SNAP_PREFIX = 'SNAP_';
const SCROLL_SETTLE_MS = 120;

maybeRenderBlockWall();
maybeRunAdsBlocker();
registerBackToTop();
registerChessFocus();
registerClaudeUsage();
registerExternalLinkRouting();
registerInstaGesture();
registerShopifyDetection();

if (navigator.userAgent.includes('Firefox')) {
  registerAudioDetection();
}

const getLayout = (): LayoutInfo => ({
  scrollHeight: document.documentElement.scrollHeight,
  clientHeight: document.documentElement.clientHeight,
  scrollY: window.scrollY,
  dpr: window.devicePixelRatio || 1,
});

const scrollToY = (y: number): void => {
  window.scrollTo({ top: y, left: 0, behavior: 'auto' });
};

const flushLayout = (): void => {
  void document.body.offsetHeight;
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const action: string | undefined = message?.action;

  if (
    action !== `${SNAP_PREFIX}GET_LAYOUT` &&
    action !== `${SNAP_PREFIX}SCROLL_TO`
  ) {
    return;
  }

  if (action === `${SNAP_PREFIX}GET_LAYOUT`) {
    sendResponse(getLayout());
    return;
  }

  scrollToY(message.y as number);
  flushLayout();
  window.setTimeout(() => {
    sendResponse({ scrollY: window.scrollY });
  }, SCROLL_SETTLE_MS);

  return true;
});
