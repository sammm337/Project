"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageConsumer = void 0;
const mongodb_1 = require("mongodb");
const logger_1 = require("../../../shared/utils/logger");
class ImageConsumer {
    constructor(mq, mongo) {
        this.mq = mq;
        this.mongo = mongo;
        this.logger = new logger_1.Logger('image-consumer');
    }
    async start() {
        await this.mq.subscribe('image.processed', async (payload) => {
            try {
                const db = this.mongo.db('travel_marketplace');
                const listingObjectId = new mongodb_1.ObjectId(payload.listingId);
                await db.collection('listings').updateOne({ _id: listingObjectId }, {
                    $set: {
                        imageUrl: payload.imageUrl,
                        enhancedImageUrl: payload.enhancedImageUrl,
                        imageMetadata: payload.metadata,
                        updatedAt: new Date()
                    }
                });
                this.logger.info(`Image processed for listing ${payload.listingId}`);
            }
            catch (error) {
                this.logger.error(`Error processing image for listing ${payload.listingId}`, error);
                throw error;
            }
        }, 'listing-service-image');
    }
}
exports.ImageConsumer = ImageConsumer;
