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
    return `[\u001b[30m${formattedDate}\u001b[0m] ${logLevelName} ${args}`;
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

  public info(...args: unknown[]) {
    return this._log(LogLevel.info, '\u001b[34m\u001b[1mINFO\u001b[0m', ...args);
  }
}

export default Logger.getInstance();
