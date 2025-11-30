"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppMock = void 0;
const logger_1 = require("../../../shared/dist/utils/logger");
class WhatsAppMock {
    constructor() {
        this.logger = new logger_1.Logger('whatsapp-mock');
    }
    async sendMessage(phoneNumber, message) {
        // Mock WhatsApp message sending
        this.logger.info(`[MOCK] Sending WhatsApp message to ${phoneNumber}: ${message.substring(0, 50)}...`);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));
        // Always succeed in mock
        return true;
    }
}
exports.WhatsAppMock = WhatsAppMock;
