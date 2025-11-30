import { Logger } from '../../../shared/dist/utils/logger';

export class SMSMock {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('sms-mock');
  }

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    // Mock SMS sending
    this.logger.info(`[MOCK] Sending SMS to ${phoneNumber}: ${message.substring(0, 50)}...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Always succeed in mock
    return true;
  }
}

