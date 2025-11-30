"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionConsumer = void 0;
const logger_1 = require("../../../shared/utils/logger");
class InteractionConsumer {
    constructor(mq, analyticsService) {
        this.mq = mq;
        this.analyticsService = analyticsService;
        this.logger = new logger_1.Logger('interaction-consumer');
    }
    async start() {
        await this.mq.subscribe('user.interaction', async (payload) => {
            try {
                await this.analyticsService.recordInteraction(payload);
                this.logger.info(`Recorded interaction: ${payload.action} for user ${payload.userId}`);
            }
            catch (error) {
                this.logger.error(`Error recording interaction for user ${payload.userId}`, error);
            }
        }, 'analytics-service-interaction');
    }
}
exports.InteractionConsumer = InteractionConsumer;
