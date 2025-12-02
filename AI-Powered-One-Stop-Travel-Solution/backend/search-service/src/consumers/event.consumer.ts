import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
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
    await this.mq.subscribe('event.created', async (payload: any) => {
      try {
        // FIX: Use 'eventId' instead of 'id'
        const id = payload.eventId || payload.id;
        this.logger.info(`Processing event.created for ${id}`);

        const searchText = `
          ${payload.title} 
          ${payload.description} 
          ${payload.tags ? payload.tags.join(' ') : ''} 
          ${payload.location?.city || ''} 
          Event from ${payload.startDate}
        `.trim();

        const vector = await this.vectorService.generateEmbedding(searchText);

        await this.vectorService.upsertPoint(
          'events',
          id, // Use the extracted ID
          vector,
          {
            entityId: id,
            agencyId: payload.agencyId,
            price: payload.price,
            startDate: payload.startDate,
            tags: payload.tags,
            title: payload.title
          }
        );

        this.logger.info(`Successfully indexed event ${id}`);

      } catch (error) {
        this.logger.error(`Error processing event.created`, error);
      }
    }, 'search-service-event');
  }
}