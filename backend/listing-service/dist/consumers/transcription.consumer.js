"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionConsumer = void 0;
const mongodb_1 = require("mongodb");
const logger_1 = require("../../../shared/dist/utils/logger");
class TranscriptionConsumer {
    constructor(mq, mongo) {
        this.mq = mq;
        this.mongo = mongo;
        this.logger = new logger_1.Logger('transcription-consumer');
    }
    async start() {
        await this.mq.subscribe('transcription.completed', async (payload) => {
            try {
                const db = this.mongo.db('travel_marketplace');
                const listingObjectId = new mongodb_1.ObjectId(payload.listingId);
                await db.collection('listings').updateOne({ _id: listingObjectId }, {
                    $set: {
                        transcript: payload.transcript,
                        transcriptLanguage: payload.language,
                        transcriptDuration: payload.duration,
                        updatedAt: new Date()
                    }
                });
                this.logger.info(`Transcript attached to listing ${payload.listingId}`);
            }
            catch (error) {
                this.logger.error(`Error processing transcription for listing ${payload.listingId}`, error);
                throw error;
            }
        }, 'listing-service-transcription');
    }
}
exports.TranscriptionConsumer = TranscriptionConsumer;
