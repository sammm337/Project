import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { EmbeddingCreatedEvent } from '../../../shared/dist/types/events';
import { VectorService } from '../services/vector.service';
import { Logger } from '../../../shared/dist/utils/logger';

export class EmbeddingConsumer {
  private mq: RabbitMQClient;
  private vectorService: VectorService;
  private logger: Logger;

  constructor(mq: RabbitMQClient, vectorService: VectorService) {
    this.mq = mq;
    this.vectorService = vectorService;
    this.logger = new Logger('embedding-consumer');
  }

  async start() {
    await this.mq.subscribe('embedding.created', async (payload: EmbeddingCreatedEvent['payload']) => {
      try {
        const collectionName = payload.entityType === 'listing' ? 'listings' : 'events';
        await this.vectorService.upsertPoint(
          collectionName,
          payload.embeddingId,
          payload.vector,
          {
            entityId: payload.entityId,
            entityType: payload.entityType,
            ...payload.metadata
          }
        );
        this.logger.info(`Indexed embedding for ${payload.entityType} ${payload.entityId}`);
      } catch (error) {
        this.logger.error(`Error indexing embedding for ${payload.entityType} ${payload.entityId}`, error);
        throw error;
      }
    }, 'search-service-embedding');
  }
}

