import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { TranscriptionCompletedEvent } from '../../../shared/dist/types/events';
import { MongoClient, ObjectId } from 'mongodb';
import { Logger } from '../../../shared/dist/utils/logger';

export class TranscriptionConsumer {
  private mq: RabbitMQClient;
  private mongo: MongoClient;
  private logger: Logger;

  constructor(mq: RabbitMQClient, mongo: MongoClient) {
    this.mq = mq;
    this.mongo = mongo;
    this.logger = new Logger('transcription-consumer');
  }

  async start() {
    await this.mq.subscribe('transcription.completed', async (payload: TranscriptionCompletedEvent['payload']) => {
      try {
        const db = this.mongo.db('travel_marketplace');
        const listingObjectId = new ObjectId(payload.listingId);
        await db.collection('listings').updateOne(
          { _id: listingObjectId },
          { 
            $set: { 
              transcript: payload.transcript,
              transcriptLanguage: payload.language,
              transcriptDuration: payload.duration,
              updatedAt: new Date()
            } 
          }
        );
        this.logger.info(`Transcript attached to listing ${payload.listingId}`);
      } catch (error) {
        this.logger.error(`Error processing transcription for listing ${payload.listingId}`, error);
        throw error;
      }
    }, 'listing-service-transcription');
  }
}

