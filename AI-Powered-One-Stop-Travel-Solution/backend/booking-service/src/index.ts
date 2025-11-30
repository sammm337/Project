import express from 'express';
import cors from 'cors';
import { bookingRouter } from './controllers/booking.controller';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

app.use('/api/bookings', bookingRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'booking-service' });
});

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`Booking service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start booking service:', error);
    process.exit(1);
  }
}

start();

