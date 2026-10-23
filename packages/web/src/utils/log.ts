export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE',
}

const colors = {
  [LogLevel.INFO]: '#00ff88',
  [LogLevel.ERROR]: '#ff4444',
  [LogLevel.WARN]: '#ffaa00',
  [LogLevel.DEBUG]: '#00aaff',
  [LogLevel.TRACE]: '#aa88ff',
};

const getTimestamp = (): string => {
  const now = new Date();
  return now.toISOString();
};

const formatLog = (level: LogLevel, message: string, ...args: unknown[]): void => {
  const timestamp = getTimestamp();
  const color = colors[level];
  console.log(
    `%c[${timestamp}] [${level}] %c${message}`,
    `color: ${color}; font-weight: bold;`,
    'color: inherit;',
    ...args,
  );
};

export const log = {
  info: (message: string, ...args: unknown[]): void => {
    formatLog(LogLevel.INFO, message, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    formatLog(LogLevel.ERROR, message, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    formatLog(LogLevel.WARN, message, ...args);
  },
  debug: (message: string, ...args: unknown[]): void => {
    formatLog(LogLevel.DEBUG, message, ...args);
  },
  trace: (message: string, ...args: unknown[]): void => {
    formatLog(LogLevel.TRACE, message, ...args);
  },
};

export default log;
