"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingConsumer = void 0;
const logger_1 = require("../../../shared/utils/logger");
class ListingConsumer {
    constructor(mq, vectorService) {
        this.mq = mq;
        this.vectorService = vectorService;
        this.logger = new logger_1.Logger('listing-consumer');
    }
    async start() {
        await this.mq.subscribe('listing.created', async (payload) => {
            try {
                // If embedding already exists, it's already indexed
                // Otherwise, we could generate an embedding here
                this.logger.info(`Listing created event received: ${payload.listingId}`);
            }
            catch (error) {
                this.logger.error(`Error processing listing.created for ${payload.listingId}`, error);
                throw error;
            }
        }, 'search-service-listing');
    }
}
exports.ListingConsumer = ListingConsumer;
