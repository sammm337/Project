import express from 'express';
import cors from 'cors';
import { listingRouter } from './controllers/listing.controller';
import { connectPostgres, connectMongo } from './db/connection';
import { RabbitMQClient } from '../../shared/dist/rabbitmq/client';
import { TranscriptionConsumer } from './consumers/transcription.consumer';
import { MarketingConsumer } from './consumers/marketing.consumer';
import { ImageConsumer } from './consumers/image.consumer';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.use('/api/listings', listingRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'listing-service' });
});

async function start() {
  try {
    // Initialize consumers
    const mq = new RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'listing-service');
    await mq.connect();
    
    const mongo = await connectMongo();
    const db = connectPostgres();

    const transcriptionConsumer = new TranscriptionConsumer(mq, mongo);
    const marketingConsumer = new MarketingConsumer(mq, mongo, db);
    const imageConsumer = new ImageConsumer(mq, mongo);

    await transcriptionConsumer.start();
    await marketingConsumer.start();
    await imageConsumer.start();

    console.log('Listing service consumers started');

    app.listen(PORT, () => {
      console.log(`Listing service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start listing service:', error);
    process.exit(1);
  }
}

start();

