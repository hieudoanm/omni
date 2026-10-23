export type LogLevel = 'debug' | 'log' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(...args: unknown[]): void;
  log(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

const isProduction = process.env.NODE_ENV === 'production';

const noop = (): void => undefined;

const timestamp = (): string => new Date().toTimeString().slice(0, 8);

const bindLevel = (
  level: LogLevel,
  prefix: string
): ((...args: unknown[]) => void) => {
  return (...args: unknown[]) => {
    if (prefix) {
      console[level]('[TAB-X]', timestamp(), prefix, ...args);
    } else {
      console[level]('[TAB-X]', timestamp(), ...args);
    }
  };
};

export const createLogger = (prefix: string): Logger => {
  if (isProduction) {
    // Content scripts run on every page; debug/log/info there is per-event
    // overhead (and console spam visible to page users) in shipped builds.
    // warn/error stay live so real failures remain diagnosable.
    return {
      debug: noop,
      log: noop,
      info: noop,
      warn: bindLevel('warn', prefix),
      error: bindLevel('error', prefix),
    };
  }
  return {
    debug: bindLevel('debug', prefix),
    log: bindLevel('log', prefix),
    info: bindLevel('info', prefix),
    warn: bindLevel('warn', prefix),
    error: bindLevel('error', prefix),
  };
};
