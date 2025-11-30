import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { MarketingGeneratedEvent } from '../../../shared/dist/types/events';
import { MongoClient, ObjectId } from 'mongodb';
import { Pool } from 'pg';
import { Logger } from '../../../shared/dist/utils/logger';

export class MarketingConsumer {
  private mq: RabbitMQClient;
  private mongo: MongoClient;
  private db: Pool;
  private logger: Logger;

  constructor(mq: RabbitMQClient, mongo: MongoClient, db: Pool) {
    this.mq = mq;
    this.mongo = mongo;
    this.db = db;
    this.logger = new Logger('marketing-consumer');
  }

  async start() {
    await this.mq.subscribe('marketing.generated', async (payload: MarketingGeneratedEvent['payload']) => {
      try {
        // Update MongoDB document
        const mongoDb = this.mongo.db('travel_marketplace');
        const listingObjectId = new ObjectId(payload.listingId);
        await mongoDb.collection('listings').updateOne(
          { _id: listingObjectId },
          { 
            $set: { 
              marketingCopy: payload.marketingCopy,
              title: payload.title,
              tags: payload.tags,
              readyForEmbedding: payload.readyForEmbedding,
              updatedAt: new Date()
            } 
          }
        );

        // Update Postgres canonical record if title/tags changed
        if (payload.title || payload.tags) {
          await this.db.query(
            'UPDATE listings SET title = COALESCE($1, title), tags = COALESCE($2, tags), updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [payload.title, payload.tags, payload.listingId]
          );
        }

        this.logger.info(`Marketing copy updated for listing ${payload.listingId}`);
      } catch (error) {
        this.logger.error(`Error processing marketing for listing ${payload.listingId}`, error);
        throw error;
      }
    }, 'listing-service-marketing');
  }
}

