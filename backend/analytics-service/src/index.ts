import express from 'express';
import cors from 'cors';
import { RabbitMQClient } from '../../shared/dist/rabbitmq/client';
import { AnalyticsService } from './services/analytics.service';
import { InteractionConsumer } from './consumers/interaction.consumer';

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analytics-service' });
});

async function start() {
  try {
    // Initialize consumers
    const mq = new RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'analytics-service');
    await mq.connect();
    
    const analyticsService = new AnalyticsService();
    const interactionConsumer = new InteractionConsumer(mq, analyticsService);

    await interactionConsumer.start();

    console.log('Analytics service consumers started');

    app.listen(PORT, () => {
      console.log(`Analytics service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start analytics service:', error);
    process.exit(1);
  }
}

start();

