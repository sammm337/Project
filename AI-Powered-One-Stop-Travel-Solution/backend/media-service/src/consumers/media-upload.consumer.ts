import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { MediaUploadedEvent } from '../../../shared/dist/types/events';
import { MediaService } from '../services/media.service';
import { Logger } from '../../../shared/dist/utils/logger';

export class MediaUploadConsumer {
  private mq: RabbitMQClient;
  private mediaService: MediaService;
  private logger: Logger;

  constructor(mq: RabbitMQClient, mediaService: MediaService) {
    this.mq = mq;
    this.mediaService = mediaService;
    this.logger = new Logger('media-upload-consumer');
  }

  async start() {
    await this.mq.subscribe('media.uploaded', async (payload: MediaUploadedEvent['payload']) => {
      try {
        await this.mediaService.processMediaUpload(payload);
        this.logger.info(`Processed media upload for ${payload.entityType} ${payload.entityId}`);
      } catch (error) {
        this.logger.error(`Error processing media upload for ${payload.entityId}`, error);
        throw error;
      }
    }, 'media-service-upload');
  }
}

