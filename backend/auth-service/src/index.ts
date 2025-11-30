import express from 'express';
import cors from 'cors';
import { authRouter } from './controllers/auth.controller';
import { connectDB } from './db/connection';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

async function start() {
  try {
    connectDB();
    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start auth service:', error);
    process.exit(1);
  }
}

start();

