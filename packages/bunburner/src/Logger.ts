enum LogLevel {
  trace = 0,
  debug = 1,
  info = 2,
  warn = 3,
  error = 4,
  fatal = 5,
}

class Logger {
  public locale = 'de-DE';

  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = LogLevel.trace;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public _setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private _formatMessage(logLevelName: string, ...args: unknown[]): string {
    const date = new Date();
    const formattedDate = date.toLocaleTimeString(this.locale);
    for (const arg of args) {
      if (typeof arg === 'object') {
        try {
          args[args.indexOf(arg)] = JSON.stringify(arg);
        } catch (e) {
          // Ignore JSON.stringify errors
        }
      }
    }
    return `[\u001b[30m${formattedDate}\u001b[0m] ${logLevelName} ${args.join(' ')}`;
  }

  private _log(
    logLevelId: LogLevel,
    logLevelName: string,
    ...args: unknown[]
  ): void {
    if (logLevelId < this.logLevel) return;
    const logArgs = [...args];
    console.log(this._formatMessage(logLevelName, ...args));
  }

  public trace(...args: unknown[]) {
    return this._log(
      LogLevel.trace,
      '\u001b[37m\u001b[1mTRACE\u001b[0m',
      ...args,
    );
  }

  public debug(...args: unknown[]) {
    return this._log(
      LogLevel.debug,
      '\u001b[36m\u001b[1mDEBUG\u001b[0m',
      ...args,
    );
  }

  public info(...args: unknown[]) {
    return this._log(
      LogLevel.info,
      '\u001b[34m\u001b[1mINFO\u001b[0m',
      ...args,
    );
  }

  public warn(...args: unknown[]) {
    return this._log(
      LogLevel.warn,
      '\u001b[33m\u001b[1mWARN\u001b[0m',
      ...args,
    );
  }

  public error(...args: unknown[]) {
    return this._log(
      LogLevel.error,
      '\u001b[35m\u001b[1mERROR\u001b[0m',
      ...args,
    );
  }

  public fatal(...args: unknown[]) {
    return this._log(
      LogLevel.fatal,
      '\u001b[31m\u001b[1mFATAL\u001b[0m',
      ...args,
    );
  }
}

export default Logger.getInstance();