import { createLogger } from '../utils/log';
import { onNextFrame } from '../utils/frame';

export interface ClaudePeriod {
  used: number;
  limit: number;
  resetAt: number | null;
}

export interface ClaudeLimitData {
  daily: ClaudePeriod;
  weekly: ClaudePeriod;
  updatedAt: number;
}

export const CLAUDE_KEY = 'claudeUsage';
export const CLAUDE_RESULT_ACTION = 'CLAUDE_RESULT';
export const CLAUDE_STORAGE_KEY = 'claudeLimit';

type PeriodPatch = Partial<Pick<ClaudeLimitData, 'daily' | 'weekly'>>;
type ClaudeResultMessage = {
  result?: ClaudeLimitData | null;
};

const STORAGE_KEY = 'claude_limit_data';
const INDICATOR_ID = 'claude-limit-indicator';
const WATCHED = ['/rate_limits', '/usage'];

const log = createLogger('Claude:');

const periodPct = (period: ClaudePeriod): number => {
  if (period.limit <= 0) return -1;
  return Math.min(100, Math.round((period.used / period.limit) * 100));
};

export const claudePercent = (
  data: ClaudeLimitData
): { daily: number | null; weekly: number | null } => ({
  daily: periodPct(data.daily) < 0 ? null : periodPct(data.daily),
  weekly: periodPct(data.weekly) < 0 ? null : periodPct(data.weekly),
});

export const claudeColor = (pct: number): string => {
  if (pct >= 90) return '#e53e3e';
  if (pct >= 60) return '#d69e2e';
  return '#38a169';
};

export const formatReset = (resetAt: number | null): string => {
  if (resetAt === null) return '?';
  const ms = resetAt - Date.now();
  if (ms <= 0) return 'now';
  const totalMin = Math.ceil(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
  }
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const loadData = (): ClaudeLimitData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClaudeLimitData) : null;
  } catch {
    return null;
  }
};

const saveData = (data: ClaudeLimitData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    log.warn('save failed', error);
  }
};

const defaultData = (): ClaudeLimitData => ({
  daily: { used: 0, limit: 0, resetAt: null },
  weekly: { used: 0, limit: 0, resetAt: null },
  updatedAt: Date.now(),
});

const mergePatch = (patch: PeriodPatch): ClaudeLimitData => {
  const current = loadData() ?? defaultData();
  if (patch.daily) current.daily = patch.daily;
  if (patch.weekly) current.weekly = patch.weekly;
  current.updatedAt = Date.now();
  saveData(current);
  return current;
};

const parseRawEntry = (entry: Record<string, unknown>): PeriodPatch => {
  const win = String(entry.window ?? '').toLowerCase();
  if (win !== 'daily' && win !== 'weekly') return {};
  const limit = Number(entry.limit ?? entry.messages_limit ?? 0);
  const remaining = Number(entry.remaining ?? entry.messages_remaining ?? 0);
  const used = Math.max(0, limit - remaining);
  const resetRaw = (entry.reset_time ?? entry.resets_at ?? null) as
    string | null;
  const resetAt = resetRaw ? new Date(resetRaw).getTime() : null;
  const period: ClaudePeriod = { used, limit, resetAt };
  return win === 'daily' ? { daily: period } : { weekly: period };
};

const tryParseArray = (body: unknown): boolean => {
  const b = body as Record<string, unknown>;
  const entries: Record<string, unknown>[] = Array.isArray(body)
    ? body
    : Array.isArray(b?.rate_limits)
      ? (b.rate_limits as Record<string, unknown>[])
      : Array.isArray(b?.limits)
        ? (b.limits as Record<string, unknown>[])
        : [];
  if (entries.length === 0) return false;
  const patch: PeriodPatch = {};
  for (const entry of entries) {
    const parsed = parseRawEntry(entry);
    if (parsed.daily) patch.daily = parsed.daily;
    if (parsed.weekly) patch.weekly = parsed.weekly;
  }
  if (Object.keys(patch).length === 0) return false;
  applyPatch(patch);
  return true;
};

const toPeriod = (o: Record<string, unknown>): ClaudePeriod => ({
  used: Number(o.messages_used ?? o.used ?? 0),
  limit: Number(o.messages_limit ?? o.limit ?? 0),
  resetAt: o.resets_at
    ? new Date(String(o.resets_at)).getTime()
    : o.reset_at
      ? new Date(String(o.reset_at)).getTime()
      : null,
});

const tryParseObject = (body: unknown): boolean => {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  const patch: PeriodPatch = {};

  if (b.daily && typeof b.daily === 'object')
    patch.daily = toPeriod(b.daily as Record<string, unknown>);
  if (b.weekly && typeof b.weekly === 'object')
    patch.weekly = toPeriod(b.weekly as Record<string, unknown>);

  if (!patch.daily && b.daily_message_count !== undefined) {
    patch.daily = {
      used: Number(b.daily_message_count),
      limit: Number(b.daily_message_limit ?? 0),
      resetAt: b.daily_reset_at
        ? new Date(String(b.daily_reset_at)).getTime()
        : null,
    };
  }
  if (!patch.weekly && b.weekly_message_count !== undefined) {
    patch.weekly = {
      used: Number(b.weekly_message_count),
      limit: Number(b.weekly_message_limit ?? 0),
      resetAt: b.weekly_reset_at
        ? new Date(String(b.weekly_reset_at)).getTime()
        : null,
    };
  }

  if (Object.keys(patch).length === 0) return false;
  applyPatch(patch);
  return true;
};

const handleBody = (url: string, body: unknown): void => {
  if (url.includes('/rate_limits')) {
    tryParseArray(body);
    return;
  }
  if (url.includes('/usage')) {
    tryParseObject(body);
    return;
  }
  if (!tryParseArray(body)) tryParseObject(body);
};

const pushResult = (data: ClaudeLimitData): void => {
  const message: ClaudeResultMessage = { result: data };
  try {
    chrome.runtime.sendMessage(
      { action: CLAUDE_RESULT_ACTION, ...message },
      () => void chrome.runtime.lastError
    );
  } catch {
    // Extension context may be gone after navigation; ignore.
  }
};

const pushClear = (): void => {
  const message: ClaudeResultMessage = { result: null };
  try {
    chrome.runtime.sendMessage(
      { action: CLAUDE_RESULT_ACTION, ...message },
      () => void chrome.runtime.lastError
    );
  } catch {
    // Extension context may be gone after navigation; ignore.
  }
};

let enabled = false;
let overrideInstalled = false;

const installFetchOverride = (): void => {
  if (overrideInstalled) return;
  overrideInstalled = true;
  const fetchImpl = window.fetch.bind(window);
  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const response = await fetchImpl(input, init);
    if (!enabled || !response.ok) return response;
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;
    if (WATCHED.some((path) => url.includes(path))) {
      response
        .clone()
        .json()
        .then((body: unknown) => handleBody(url, body))
        .catch(() => undefined);
    }
    return response;
  };
};

const injectStyles = (): void => {
  if (document.getElementById('claude-limit-styles')) return;
  const style = document.createElement('style');
  style.id = 'claude-limit-styles';
  style.textContent = `
    #${INDICATOR_ID} {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
      font-size: 11px;
      line-height: 1;
      opacity: 0.55;
      transition: opacity 0.15s;
      user-select: none;
      white-space: nowrap;
      cursor: default;
      padding: 0 4px;
    }
    #${INDICATOR_ID}:hover { opacity: 1; }
    .cl-period {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .cl-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.6;
    }
    .cl-pct  { font-weight: 700; font-size: 11px; }
    .cl-reset { font-size: 10px; opacity: 0.6; }
    .cl-sep   { opacity: 0.3; font-size: 10px; }
  `;
  document.head.appendChild(style);
};

const buildIndicator = (data: ClaudeLimitData): HTMLElement => {
  const el = document.createElement('div');
  el.id = INDICATOR_ID;
  const dailyPct = periodPct(data.daily);
  const weeklyPct = periodPct(data.weekly);

  if (dailyPct < 0 && weeklyPct < 0) {
    el.style.opacity = '0.3';
    el.style.fontSize = '10px';
    el.textContent = 'no usage data';
    return el;
  }

  const makePeriod = (
    label: string,
    period: ClaudePeriod,
    pct: number
  ): HTMLElement => {
    const span = document.createElement('span');
    span.className = 'cl-period';
    const labelEl = document.createElement('span');
    labelEl.className = 'cl-label';
    labelEl.textContent = label;
    const pctEl = document.createElement('span');
    pctEl.className = 'cl-pct';
    pctEl.style.color = claudeColor(pct);
    pctEl.textContent = `${Math.min(100, pct)}%`;
    const resetEl = document.createElement('span');
    resetEl.className = 'cl-reset';
    resetEl.textContent = `\u21bb ${formatReset(period.resetAt)}`;
    span.append(labelEl, pctEl, resetEl);
    return span;
  };

  if (dailyPct >= 0) el.appendChild(makePeriod('D', data.daily, dailyPct));

  if (dailyPct >= 0 && weeklyPct >= 0) {
    const sep = document.createElement('span');
    sep.className = 'cl-sep';
    sep.textContent = '\u00b7';
    el.appendChild(sep);
  }

  if (weeklyPct >= 0) el.appendChild(makePeriod('W', data.weekly, weeklyPct));

  return el;
};

const findMountTarget = (): Element | null => {
  const byId = document.querySelector('[data-testid="input-menu-container"]');
  if (byId) return byId;

  const sendBtn =
    document.querySelector('button[aria-label*="Send"]') ??
    document.querySelector('button[data-testid*="send"]');
  if (sendBtn) {
    let el: Element | null = sendBtn.parentElement;
    for (let i = 0; i < 6 && el; i++) {
      const cs = window.getComputedStyle(el);
      if (
        (cs.display === 'flex' || cs.display === 'inline-flex') &&
        el.children.length > 1
      )
        return el;
      el = el.parentElement;
    }
    return sendBtn.parentElement;
  }

  const editor = document.querySelector('.ProseMirror');
  if (editor) return editor.closest("form, fieldset, [class*='input']");

  return null;
};

const renderIndicator = (data: ClaudeLimitData): void => {
  injectStyles();
  const existing = document.getElementById(INDICATOR_ID);
  const fresh = buildIndicator(data);
  if (existing) {
    existing.replaceWith(fresh);
    return;
  }
  const target = findMountTarget();
  if (!target) return;
  target.insertBefore(fresh, target.firstChild);
};

const tryMount = (): void => {
  const data = loadData();
  if (data && (data.daily.limit > 0 || data.weekly.limit > 0))
    renderIndicator(data);
};

const applyPatch = (patch: PeriodPatch): void => {
  const data = mergePatch(patch);
  renderIndicator(data);
  pushResult(data);
};

let monitoring = false;
let mountRetryScheduled = false;

const scheduleMountRetry = (): void => {
  if (mountRetryScheduled) return;
  mountRetryScheduled = true;
  onNextFrame(() => {
    mountRetryScheduled = false;
    if (document.getElementById(INDICATOR_ID)) return;
    tryMount();
  });
};

const startMonitoring = (): void => {
  if (monitoring) return;
  monitoring = true;
  const MutationObserverCtor =
    window.MutationObserver ||
    (
      window as unknown as {
        WebKitMutationObserver: typeof MutationObserver;
      }
    ).WebKitMutationObserver;
  if (MutationObserverCtor) {
    const observer = new MutationObserverCtor(scheduleMountRetry);
    observer.observe(document, { childList: true, subtree: true });
  }
  window.setTimeout(tryMount, 1000);
  window.setTimeout(tryMount, 3000);
  window.setInterval(() => {
    const data = loadData();
    if (data) renderIndicator(data);
  }, 60_000);
};

const start = (): void => {
  enabled = true;
  installFetchOverride();
  startMonitoring();
  tryMount();
};

const stop = (): void => {
  enabled = false;
  document.getElementById(INDICATOR_ID)?.remove();
  pushClear();
};

const isClaudeEnabled = (): Promise<boolean> =>
  new Promise((resolve) => {
    chrome.storage.sync.get(CLAUDE_KEY, (result) => {
      if (chrome.runtime.lastError) {
        resolve(true);
        return;
      }
      resolve(result[CLAUDE_KEY] !== false);
    });
  });

export const registerClaudeUsage = (): void => {
  const hostname = window.location.hostname
    .replace(/^www\./i, '')
    .toLowerCase();
  if (hostname !== 'claude.ai' && !hostname.endsWith('.claude.ai')) return;

  void isClaudeEnabled().then((on) => {
    if (on) {
      start();
    } else {
      stop();
    }
    log.info(`registered enabled=${on}`);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync' || !(CLAUDE_KEY in changes)) return;
    const on = changes[CLAUDE_KEY]?.newValue !== false;
    if (on) {
      start();
    } else {
      stop();
    }
  });
};
