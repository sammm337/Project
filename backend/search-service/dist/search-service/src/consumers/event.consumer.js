"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConsumer = void 0;
const logger_1 = require("../../../shared/utils/logger");
class EventConsumer {
    constructor(mq, vectorService) {
        this.mq = mq;
        this.vectorService = vectorService;
        this.logger = new logger_1.Logger('event-consumer');
    }
    async start() {
        await this.mq.subscribe('event.created', async (payload) => {
            try {
                // If embedding already exists, it's already indexed
                this.logger.info(`Event created event received: ${payload.eventId}`);
            }
            catch (error) {
                this.logger.error(`Error processing event.created for ${payload.eventId}`, error);
                throw error;
            }
        }, 'search-service-event');
    }
}
exports.EventConsumer = EventConsumer;
