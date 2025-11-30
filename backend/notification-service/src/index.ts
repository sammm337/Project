import express from 'express';
import cors from 'cors';
import { RabbitMQClient } from '../../shared/dist/rabbitmq/client';
import { NotificationService } from './services/notification.service';
import { BookingConsumer } from './consumers/booking.consumer';

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

async function start() {
  try {
    // Initialize consumers
    const mq = new RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'notification-service');
    await mq.connect();
    
    const notificationService = new NotificationService();
    const bookingConsumer = new BookingConsumer(mq, notificationService);

    await bookingConsumer.start();

    console.log('Notification service consumers started');

    app.listen(PORT, () => {
      console.log(`Notification service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start notification service:', error);
    process.exit(1);
  }
}

start();

