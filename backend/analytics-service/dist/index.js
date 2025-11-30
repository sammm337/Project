"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("../../shared/dist/rabbitmq/client");
const analytics_service_1 = require("./services/analytics.service");
const interaction_consumer_1 = require("./consumers/interaction.consumer");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3010;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'analytics-service' });
});
async function start() {
    try {
        // Initialize consumers
        const mq = new client_1.RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'analytics-service');
        await mq.connect();
        const analyticsService = new analytics_service_1.AnalyticsService();
        const interactionConsumer = new interaction_consumer_1.InteractionConsumer(mq, analyticsService);
        await interactionConsumer.start();
        console.log('Analytics service consumers started');
        app.listen(PORT, () => {
            console.log(`Analytics service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start analytics service:', error);
        process.exit(1);
    }
}
start();
