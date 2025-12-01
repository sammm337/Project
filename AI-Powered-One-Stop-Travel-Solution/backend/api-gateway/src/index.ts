import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(cors());

// ❌ DO NOT USE express.json() BEFORE PROXY
// app.use(express.json());

const services: Record<string, string> = {
  '/auth': process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  '/api/user': process.env.USER_SERVICE_URL || 'http://user-service:3002',
  '/api/vendor': process.env.VENDOR_SERVICE_URL || 'http://vendor-service:3003',
  '/api/listings': process.env.LISTING_SERVICE_URL || 'http://listing-service:3004',
  '/api/events': process.env.EVENT_SERVICE_URL || 'http://event-service:3005',
  '/api/bookings': process.env.BOOKING_SERVICE_URL || 'http://booking-service:3006',
  '/search': process.env.SEARCH_SERVICE_URL || 'http://search-service:3007',
  '/api/media': process.env.MEDIA_SERVICE_URL || 'http://media-service:3008',
  '/api/traveler': process.env.TRAVELER_SERVICE_URL || 'http://traveler-service:3011',
  '/ws': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3009'
};

// 🔥 FIX: Proxy BEFORE body parser
Object.entries(services).forEach(([path, target]) => {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      proxyTimeout: 5000,
      timeout: 5000,
      // Important: do NOT parse body before proxying
      selfHandleResponse: false,
      onError: (err, req, res) => {
        console.error(`Proxy error for ${path}:`, err.message);
        res.status(502).json({ error: 'Service unavailable' });
      }
    })
  );
});

// ✔ NOW we can safely parse JSON for routes handled by the gateway itself
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
