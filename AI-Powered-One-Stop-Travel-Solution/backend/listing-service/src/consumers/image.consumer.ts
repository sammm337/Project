import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { ImageProcessedEvent } from '../../../shared/dist/types/events';
import { MongoClient, ObjectId } from 'mongodb';
import { Logger } from '../../../shared/dist/utils/logger';

export class ImageConsumer {
  private mq: RabbitMQClient;
  private mongo: MongoClient;
  private logger: Logger;

  constructor(mq: RabbitMQClient, mongo: MongoClient) {
    this.mq = mq;
    this.mongo = mongo;
    this.logger = new Logger('image-consumer');
  }

  async start() {
    await this.mq.subscribe('image.processed', async (payload: ImageProcessedEvent['payload']) => {
      try {
        const db = this.mongo.db('travel_marketplace');
        const listingObjectId = new ObjectId(payload.listingId);
        await db.collection('listings').updateOne(
          { _id: listingObjectId },
          { 
            $set: { 
              imageUrl: payload.imageUrl,
              enhancedImageUrl: payload.enhancedImageUrl,
              imageMetadata: payload.metadata,
              updatedAt: new Date()
            } 
          }
        );
        this.logger.info(`Image processed for listing ${payload.listingId}`);
      } catch (error) {
        this.logger.error(`Error processing image for listing ${payload.listingId}`, error);
        throw error;
      }
    }, 'listing-service-image');
  }
}

