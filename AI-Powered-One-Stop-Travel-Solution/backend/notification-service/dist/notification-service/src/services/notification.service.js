"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const whatsapp_mock_1 = require("./whatsapp.mock");
const sms_mock_1 = require("./sms.mock");
const logger_1 = require("../../../shared/utils/logger");
class NotificationService {
    constructor() {
        this.whatsapp = new whatsapp_mock_1.WhatsAppMock();
        this.sms = new sms_mock_1.SMSMock();
        this.logger = new logger_1.Logger('notification-service');
    }
    async sendBookingConfirmation(phoneNumber, bookingDetails) {
        const message = `Your booking is confirmed! Booking ID: ${bookingDetails.bookingId}, Amount: $${bookingDetails.totalAmount}`;
        // Try WhatsApp first, fallback to SMS
        try {
            await this.whatsapp.sendMessage(phoneNumber, message);
            this.logger.info(`Sent booking confirmation via WhatsApp to ${phoneNumber}`);
        }
        catch (error) {
            this.logger.warn(`WhatsApp failed, trying SMS for ${phoneNumber}`);
            await this.sms.sendSMS(phoneNumber, message);
            this.logger.info(`Sent booking confirmation via SMS to ${phoneNumber}`);
        }
    }
    async sendPaymentConfirmation(phoneNumber, paymentDetails) {
        const message = `Payment successful! Transaction ID: ${paymentDetails.transactionId}, Amount: $${paymentDetails.amount}`;
        try {
            await this.whatsapp.sendMessage(phoneNumber, message);
        }
        catch (error) {
            await this.sms.sendSMS(phoneNumber, message);
        }
    }
}
exports.NotificationService = NotificationService;
