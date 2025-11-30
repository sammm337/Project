import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { ListingCreatedEvent } from '../../../shared/dist/types/events';
import { VectorService } from '../services/vector.service';
import { Logger } from '../../../shared/dist/utils/logger';

export class ListingConsumer {
  private mq: RabbitMQClient;
  private vectorService: VectorService;
  private logger: Logger;

  constructor(mq: RabbitMQClient, vectorService: VectorService) {
    this.mq = mq;
    this.vectorService = vectorService;
    this.logger = new Logger('listing-consumer');
  }

  async start() {
    await this.mq.subscribe('listing.created', async (payload: ListingCreatedEvent['payload']) => {
      try {
        // If embedding already exists, it's already indexed
        // Otherwise, we could generate an embedding here
        this.logger.info(`Listing created event received: ${payload.listingId}`);
      } catch (error) {
        this.logger.error(`Error processing listing.created for ${payload.listingId}`, error);
        throw error;
      }
    }, 'search-service-listing');
  }
}

