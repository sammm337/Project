"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSMock = void 0;
const logger_1 = require("../../../shared/utils/logger");
class SMSMock {
    constructor() {
        this.logger = new logger_1.Logger('sms-mock');
    }
    async sendSMS(phoneNumber, message) {
        // Mock SMS sending
        this.logger.info(`[MOCK] Sending SMS to ${phoneNumber}: ${message.substring(0, 50)}...`);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));
        // Always succeed in mock
        return true;
    }
}
exports.SMSMock = SMSMock;
