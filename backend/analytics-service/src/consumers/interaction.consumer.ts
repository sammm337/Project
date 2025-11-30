import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { UserInteractionEvent } from '../../../shared/dist/types/events';
import { AnalyticsService } from '../services/analytics.service';
import { Logger } from '../../../shared/dist/utils/logger';

export class InteractionConsumer {
  private mq: RabbitMQClient;
  private analyticsService: AnalyticsService;
  private logger: Logger;

  constructor(mq: RabbitMQClient, analyticsService: AnalyticsService) {
    this.mq = mq;
    this.analyticsService = analyticsService;
    this.logger = new Logger('interaction-consumer');
  }

  async start() {
    await this.mq.subscribe('user.interaction', async (payload: UserInteractionEvent['payload']) => {
      try {
        await this.analyticsService.recordInteraction(payload);
        this.logger.info(`Recorded interaction: ${payload.action} for user ${payload.userId}`);
      } catch (error) {
        this.logger.error(`Error recording interaction for user ${payload.userId}`, error);
      }
    }, 'analytics-service-interaction');
  }
}

