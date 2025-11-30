import express from 'express';
import cors from 'cors';
import { eventRouter } from './controllers/event.controller';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.use('/api/events', eventRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'event-service' });
});

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`Event service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start event service:', error);
    process.exit(1);
  }
}

start();

