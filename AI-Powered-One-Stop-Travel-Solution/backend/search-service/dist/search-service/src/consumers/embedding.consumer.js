"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingConsumer = void 0;
const logger_1 = require("../../../shared/utils/logger");
class EmbeddingConsumer {
    constructor(mq, vectorService) {
        this.mq = mq;
        this.vectorService = vectorService;
        this.logger = new logger_1.Logger('embedding-consumer');
    }
    async start() {
        await this.mq.subscribe('embedding.created', async (payload) => {
            try {
                const collectionName = payload.entityType === 'listing' ? 'listings' : 'events';
                await this.vectorService.upsertPoint(collectionName, payload.embeddingId, payload.vector, {
                    entityId: payload.entityId,
                    entityType: payload.entityType,
                    ...payload.metadata
                });
                this.logger.info(`Indexed embedding for ${payload.entityType} ${payload.entityId}`);
            }
            catch (error) {
                this.logger.error(`Error indexing embedding for ${payload.entityType} ${payload.entityId}`, error);
                throw error;
            }
        }, 'search-service-embedding');
    }
}
exports.EmbeddingConsumer = EmbeddingConsumer;
