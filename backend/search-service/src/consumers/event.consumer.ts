import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { EventCreatedEvent } from '../../../shared/dist/types/events';
import { VectorService } from '../services/vector.service';
import { Logger } from '../../../shared/dist/utils/logger';

export class EventConsumer {
  private mq: RabbitMQClient;
  private vectorService: VectorService;
  private logger: Logger;

  constructor(mq: RabbitMQClient, vectorService: VectorService) {
    this.mq = mq;
    this.vectorService = vectorService;
    this.logger = new Logger('event-consumer');
  }

  async start() {
    await this.mq.subscribe('event.created', async (payload: EventCreatedEvent['payload']) => {
      try {
        // If embedding already exists, it's already indexed
        this.logger.info(`Event created event received: ${payload.eventId}`);
      } catch (error) {
        this.logger.error(`Error processing event.created for ${payload.eventId}`, error);
        throw error;
      }
    }, 'search-service-event');
  }
}

