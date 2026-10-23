import { createLogger } from '../utils/log';

export const SOUND_AUDIBLE_ACTION = 'SOUND_AUDIBLE';

// Low-frequency safety net; the event listeners below do the real work.
const FALLBACK_SWEEP_MS = 5000;
const MEDIA_SELECTOR = 'video,audio';

const log = createLogger('Audio:');

const isProducingAudio = (): boolean => {
  const elements = document.querySelectorAll<HTMLMediaElement>(MEDIA_SELECTOR);
  for (const media of elements) {
    if (!media.paused && !media.ended && !media.muted && media.volume > 0) {
      return true;
    }
  }
  return false;
};

let lastReported = false;

const report = (playing: boolean): void => {
  if (playing === lastReported) return;
  lastReported = playing;
  log.info(`state change → playing=${playing}`);
  try {
    chrome.runtime.sendMessage(
      { action: SOUND_AUDIBLE_ACTION, playing },
      () => {
        if (chrome.runtime.lastError) {
          log.debug('no receiver:', chrome.runtime.lastError.message);
        }
      }
    );
  } catch (err) {
    log.debug('sendMessage threw:', err);
  }
};

const sweep = (): void => {
  report(isProducingAudio());
};

const touchesMedia = (nodes: readonly Node[]): boolean => {
  for (const node of nodes) {
    if (
      node instanceof Element &&
      (node.matches(MEDIA_SELECTOR) || node.querySelector(MEDIA_SELECTOR))
    ) {
      return true;
    }
  }
  return false;
};

const observeMedia = (): void => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const added = Array.from(mutation.addedNodes);
      const removed = Array.from(mutation.removedNodes);
      if (touchesMedia(added) || touchesMedia(removed)) {
        sweep();
        return;
      }
    }
  });
  observer.observe(document, { childList: true, subtree: true });
};

export const registerAudioDetection = (): void => {
  if (window.top !== window) {
    log.debug('skipping (not top frame)');
    return;
  }
  log.info('registering media play/pause listeners');
  document.addEventListener('play', sweep, true);
  document.addEventListener('pause', sweep, true);
  document.addEventListener('ended', sweep, true);
  document.addEventListener('volumechange', sweep, true);
  observeMedia();
  sweep();
  window.setInterval(sweep, FALLBACK_SWEEP_MS);
};
