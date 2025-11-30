import express from 'express';
import cors from 'cors';
import { vendorRouter } from './controllers/vendor.controller';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/api/vendor', vendorRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vendor-service' });
});

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`Vendor service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start vendor service:', error);
    process.exit(1);
  }
}

start();

