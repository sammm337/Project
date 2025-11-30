import { WhatsAppMock } from './whatsapp.mock';
import { SMSMock } from './sms.mock';
import { Logger } from '../../../shared/dist/utils/logger';

export class NotificationService {
  private whatsapp: WhatsAppMock;
  private sms: SMSMock;
  private logger: Logger;

  constructor() {
    this.whatsapp = new WhatsAppMock();
    this.sms = new SMSMock();
    this.logger = new Logger('notification-service');
  }

  async sendBookingConfirmation(phoneNumber: string, bookingDetails: any) {
    const message = `Your booking is confirmed! Booking ID: ${bookingDetails.bookingId}, Amount: $${bookingDetails.totalAmount}`;
    
    // Try WhatsApp first, fallback to SMS
    try {
      await this.whatsapp.sendMessage(phoneNumber, message);
      this.logger.info(`Sent booking confirmation via WhatsApp to ${phoneNumber}`);
    } catch (error) {
      this.logger.warn(`WhatsApp failed, trying SMS for ${phoneNumber}`);
      await this.sms.sendSMS(phoneNumber, message);
      this.logger.info(`Sent booking confirmation via SMS to ${phoneNumber}`);
    }
  }

  async sendPaymentConfirmation(phoneNumber: string, paymentDetails: any) {
    const message = `Payment successful! Transaction ID: ${paymentDetails.transactionId}, Amount: $${paymentDetails.amount}`;
    
    try {
      await this.whatsapp.sendMessage(phoneNumber, message);
    } catch (error) {
      await this.sms.sendSMS(phoneNumber, message);
    }
  }
}

