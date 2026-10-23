import { createLogger } from '../utils/log';

export const GET_SOUND_STATE_ACTION = 'GET_SOUND_STATE';
export const SOUND_MUTE_TAB_ACTION = 'SOUND_MUTE_TAB';
export const SOUND_MUTE_ALL_ACTION = 'SOUND_MUTE_ALL';
export const SOUND_MUTE_OTHERS_ACTION = 'SOUND_MUTE_OTHERS';
export const SOUND_STATE_CHANGED_ACTION = 'SOUND_STATE_CHANGED';

const log = createLogger('Sound:');

export type SoundTabInfo = {
  tabId: number;
  title: string;
  hostname: string;
  favIconUrl: string;
  audible: boolean;
  muted: boolean;
};

export type SoundState = {
  tabs: SoundTabInfo[];
};

export const toHostname = (url: string | undefined): string => {
  if (!url) return '';
  try {
    const hostname = new URL(url).hostname;
    log.debug('toHostname', { url, hostname });
    return hostname;
  } catch {
    log.debug('unparseable tab url', url);
    return '';
  }
};

export const toSoundTabInfo = (tab: chrome.tabs.Tab): SoundTabInfo | null => {
  if (tab.id == null) return null;
  const hostname = toHostname(tab.url);
  const info: SoundTabInfo = {
    tabId: tab.id,
    title: tab.title || hostname || 'Untitled',
    hostname,
    favIconUrl: tab.favIconUrl ?? '',
    audible: tab.audible === true,
    muted: tab.mutedInfo?.muted === true,
  };
  log.info('toSoundTabInfo', {
    tabId: info.tabId,
    title: info.title,
    hostname: info.hostname,
    audible: info.audible,
    muted: info.muted,
    rawAudible: tab.audible,
    rawMuted: tab.mutedInfo?.muted,
  });
  return info;
};
