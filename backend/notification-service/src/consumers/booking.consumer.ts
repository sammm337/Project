import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { BookingCreatedEvent, PaymentSucceededEvent } from '../../../shared/dist/types/events';
import { NotificationService } from '../services/notification.service';
import { Logger } from '../../../shared/dist/utils/logger';

export class BookingConsumer {
  private mq: RabbitMQClient;
  private notificationService: NotificationService;
  private logger: Logger;

  constructor(mq: RabbitMQClient, notificationService: NotificationService) {
    this.mq = mq;
    this.notificationService = notificationService;
    this.logger = new Logger('booking-consumer');
  }

  async start() {
    // Subscribe to booking.created
    await this.mq.subscribe('booking.created', async (payload: BookingCreatedEvent['payload']) => {
      try {
        // In a real implementation, fetch user phone number from user service
        const phoneNumber = '+1234567890'; // Mock phone number
        await this.notificationService.sendBookingConfirmation(phoneNumber, payload);
        this.logger.info(`Sent booking confirmation for booking ${payload.bookingId}`);
      } catch (error) {
        this.logger.error(`Error sending booking notification for ${payload.bookingId}`, error);
      }
    }, 'notification-service-booking');

    // Subscribe to payment.succeeded
    await this.mq.subscribe('payment.succeeded', async (payload: PaymentSucceededEvent['payload']) => {
      try {
        const phoneNumber = '+1234567890'; // Mock phone number
        await this.notificationService.sendPaymentConfirmation(phoneNumber, payload);
        this.logger.info(`Sent payment confirmation for payment ${payload.paymentId}`);
      } catch (error) {
        this.logger.error(`Error sending payment notification for ${payload.paymentId}`, error);
      }
    }, 'notification-service-payment');
  }
}

