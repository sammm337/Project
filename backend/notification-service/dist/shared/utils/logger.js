"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(serviceName) {
        this.serviceName = serviceName;
    }
    info(message, ...args) {
        console.log(`[${new Date().toISOString()}] [${this.serviceName}] [INFO] ${message}`, ...args);
    }
    error(message, error, ...args) {
        console.error(`[${new Date().toISOString()}] [${this.serviceName}] [ERROR] ${message}`, error, ...args);
    }
    warn(message, ...args) {
        console.warn(`[${new Date().toISOString()}] [${this.serviceName}] [WARN] ${message}`, ...args);
    }
    debug(message, ...args) {
        if (process.env.DEBUG === 'true') {
            console.debug(`[${new Date().toISOString()}] [${this.serviceName}] [DEBUG] ${message}`, ...args);
        }
    }
}
exports.Logger = Logger;
