import express from 'express';
import cors from 'cors';
import { searchRouter } from './controllers/search.controller';
import { connectMongo } from './db/connection';
import { RabbitMQClient } from '../../shared/dist/rabbitmq/client';
import { VectorService } from './services/vector.service';
import { EmbeddingConsumer } from './consumers/embedding.consumer';
import { ListingConsumer } from './consumers/listing.consumer';
import { EventConsumer } from './consumers/event.consumer';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

app.use('/search', searchRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'search-service' });
});

async function start() {
  try {
    // Initialize consumers
    const mq = new RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'search-service');
    await mq.connect();
    
    await connectMongo();
    const vectorService = new VectorService();

    const embeddingConsumer = new EmbeddingConsumer(mq, vectorService);
    const listingConsumer = new ListingConsumer(mq, vectorService);
    const eventConsumer = new EventConsumer(mq, vectorService);

    await embeddingConsumer.start();
    await listingConsumer.start();
    await eventConsumer.start();

    console.log('Search service consumers started');

    app.listen(PORT, () => {
      console.log(`Search service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start search service:', error);
    process.exit(1);
  }
}

start();

