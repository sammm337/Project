import { Logger } from '../../../shared/dist/utils/logger';

export class WhatsAppMock {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('whatsapp-mock');
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    // Mock WhatsApp message sending
    this.logger.info(`[MOCK] Sending WhatsApp message to ${phoneNumber}: ${message.substring(0, 50)}...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Always succeed in mock
    return true;
  }
}

