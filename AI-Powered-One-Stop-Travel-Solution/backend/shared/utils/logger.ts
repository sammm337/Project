export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  info(message: string, ...args: any[]) {
    console.log(`[${new Date().toISOString()}] [${this.serviceName}] [INFO] ${message}`, ...args);
  }

  error(message: string, error?: any, ...args: any[]) {
    console.error(`[${new Date().toISOString()}] [${this.serviceName}] [ERROR] ${message}`, error, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${new Date().toISOString()}] [${this.serviceName}] [WARN] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    if (process.env.DEBUG === 'true') {
      console.debug(`[${new Date().toISOString()}] [${this.serviceName}] [DEBUG] ${message}`, ...args);
    }
  }
}

