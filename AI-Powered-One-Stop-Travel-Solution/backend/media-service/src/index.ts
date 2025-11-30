import express from 'express';
import cors from 'cors';
import { mediaRouter } from './controllers/media.controller';
import { RabbitMQClient } from '../../shared/dist/rabbitmq/client';
import { MediaService } from './services/media.service';
import { MediaUploadConsumer } from './consumers/media-upload.consumer';

const app = express();
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(express.json());

app.use('/api/media', mediaRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'media-service' });
});

async function start() {
  try {
    // Initialize consumers
    const mq = new RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'media-service');
    await mq.connect();
    
    const mediaService = new MediaService();
    const mediaUploadConsumer = new MediaUploadConsumer(mq, mediaService);

    await mediaUploadConsumer.start();

    console.log('Media service consumers started');

    app.listen(PORT, () => {
      console.log(`Media service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start media service:', error);
    process.exit(1);
  }
}

start();

