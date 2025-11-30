"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const services = {
    '/auth': process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    '/api/user': process.env.USER_SERVICE_URL || 'http://user-service:3002',
    '/api/vendor': process.env.VENDOR_SERVICE_URL || 'http://vendor-service:3003',
    '/api/listings': process.env.LISTING_SERVICE_URL || 'http://listing-service:3004',
    '/api/events': process.env.EVENT_SERVICE_URL || 'http://event-service:3005',
    '/api/bookings': process.env.BOOKING_SERVICE_URL || 'http://booking-service:3006',
    '/search': process.env.SEARCH_SERVICE_URL || 'http://search-service:3007',
    '/api/media': process.env.MEDIA_SERVICE_URL || 'http://media-service:3008',
    '/api/traveler': process.env.TRAVELER_SERVICE_URL || 'http://traveler-service:3011'
};
Object.entries(services).forEach(([path, target]) => {
    app.use(path, (0, http_proxy_middleware_1.createProxyMiddleware)({
        target,
        changeOrigin: true,
        pathRewrite: (path, req) => {
            // Remove the path prefix for proxying
            if (path === '/auth') {
                return path;
            }
            return path;
        },
        onError: (err, req, res) => {
            console.error(`Proxy error for ${path}:`, err.message);
            res.status(500).json({ success: false, error: 'Service unavailable' });
        }
    }));
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('Proxying routes:');
    Object.entries(services).forEach(([path, target]) => {
        console.log(`  ${path} -> ${target}`);
    });
});
