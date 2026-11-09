export const DEFAULT_TARGET_URL = 'https://hieudoanm.github.io';
export const TARGET_URL_KEY = 'newTabTargetUrl';

const REDIRECT_KEY = 'redirectNewTabs';

const isNewTab = (url: string | undefined): boolean => {
  if (!url) return false;
  return (
    url.startsWith('chrome://newtab') ||
    url.startsWith('about:newtab') ||
    url.startsWith('about:home') ||
    url.startsWith('about:privatebrowsing')
  );
};

const getStoredTargetUrl = (): Promise<string> =>
  new Promise((resolve) => {
    chrome.storage.sync.get(TARGET_URL_KEY, (result) => {
      if (chrome.runtime.lastError) {
        resolve(DEFAULT_TARGET_URL);
        return;
      }
      const value = result[TARGET_URL_KEY];
      resolve(
        typeof value === 'string' && value.trim()
          ? value.trim()
          : DEFAULT_TARGET_URL
      );
    });
  });

const shouldRedirect = (): Promise<boolean> =>
  new Promise((resolve) => {
    chrome.storage.sync.get(REDIRECT_KEY, (result) => {
      if (chrome.runtime.lastError) {
        resolve(true);
        return;
      }
      resolve(result[REDIRECT_KEY] !== false);
    });
  });

const maybeRedirect = async (tabId: number): Promise<void> => {
  if (!(await shouldRedirect())) return;
  const target = await getStoredTargetUrl();
  if (isNewTab(target)) return;
  chrome.tabs.update(tabId, { url: target });
};

export const registerNewTabRedirect = (): void => {
  chrome.tabs.onCreated.addListener((tab) => {
    const tabId = tab.id;
    if (tabId === undefined) return;
    if (!isNewTab(tab.url) && !isNewTab(tab.pendingUrl)) return;
    void maybeRedirect(tabId);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url && isNewTab(changeInfo.url)) {
      void maybeRedirect(tabId);
    }
  });
};
