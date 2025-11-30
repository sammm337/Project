import express from 'express';
import cors from 'cors';
import { userRouter } from './controllers/user.controller';
import { connectDB } from './db/connection';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api/user', userRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

async function start() {
  try {
    connectDB();
    app.listen(PORT, () => {
      console.log(`User service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start user service:', error);
    process.exit(1);
  }
}

start();

