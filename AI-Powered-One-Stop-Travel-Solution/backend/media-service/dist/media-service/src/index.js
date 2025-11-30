"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const media_controller_1 = require("./controllers/media.controller");
const client_1 = require("../../shared/rabbitmq/client");
const media_service_1 = require("./services/media.service");
const media_upload_consumer_1 = require("./consumers/media-upload.consumer");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3008;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/media', media_controller_1.mediaRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'media-service' });
});
async function start() {
    try {
        // Initialize consumers
        const mq = new client_1.RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'media-service');
        await mq.connect();
        const mediaService = new media_service_1.MediaService();
        const mediaUploadConsumer = new media_upload_consumer_1.MediaUploadConsumer(mq, mediaService);
        await mediaUploadConsumer.start();
        console.log('Media service consumers started');
        app.listen(PORT, () => {
            console.log(`Media service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start media service:', error);
        process.exit(1);
    }
}
start();
