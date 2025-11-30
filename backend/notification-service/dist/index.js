"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("../../shared/dist/rabbitmq/client");
const notification_service_1 = require("./services/notification.service");
const booking_consumer_1 = require("./consumers/booking.consumer");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3009;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notification-service' });
});
async function start() {
    try {
        // Initialize consumers
        const mq = new client_1.RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'notification-service');
        await mq.connect();
        const notificationService = new notification_service_1.NotificationService();
        const bookingConsumer = new booking_consumer_1.BookingConsumer(mq, notificationService);
        await bookingConsumer.start();
        console.log('Notification service consumers started');
        app.listen(PORT, () => {
            console.log(`Notification service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start notification service:', error);
        process.exit(1);
    }
}
start();
