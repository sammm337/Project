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
        // Handle both 'listingId' (standard) and 'id' (fallback)
        const id = payload.listingId || (payload as any).id;
        
        this.logger.info(`Processing listing.created for ${id}`);

        // 1. Create a rich text representation for semantic search
        const searchText = `
          ${payload.title} 
          ${payload.description} 
          ${payload.tags ? payload.tags.join(' ') : ''} 
          ${payload.location?.city || ''} 
          ${payload.location?.country || ''}
        `.trim();

        // 2. Generate Embedding
        const vector = await this.vectorService.generateEmbedding(searchText);

        // 3. Upsert to Qdrant
        await this.vectorService.upsertPoint(
          'listings',
          id,
          vector,
          {
            entityId: id,
            vendorId: payload.vendorId,
            price: payload.price,
            status: 'published', // We assume it's published if we receive this event
            tags: payload.tags,
            title: payload.title
          }
        );

        this.logger.info(`Successfully indexed listing ${id}`);

      } catch (error) {
        this.logger.error(`Error processing listing.created`, error);
      }
    }, 'search-service-listing');
  }
}