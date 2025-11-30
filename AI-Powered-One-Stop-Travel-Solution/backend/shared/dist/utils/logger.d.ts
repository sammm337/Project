export declare class Logger {
    private serviceName;
    constructor(serviceName: string);
    info(message: string, ...args: any[]): void;
    error(message: string, error?: any, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}
