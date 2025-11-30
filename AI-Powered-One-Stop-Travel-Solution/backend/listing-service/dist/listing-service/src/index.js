"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const listing_controller_1 = require("./controllers/listing.controller");
const connection_1 = require("./db/connection");
const client_1 = require("../../shared/rabbitmq/client");
const transcription_consumer_1 = require("./consumers/transcription.consumer");
const marketing_consumer_1 = require("./consumers/marketing.consumer");
const image_consumer_1 = require("./consumers/image.consumer");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3004;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/listings', listing_controller_1.listingRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'listing-service' });
});
async function start() {
    try {
        // Initialize consumers
        const mq = new client_1.RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'listing-service');
        await mq.connect();
        const mongo = await (0, connection_1.connectMongo)();
        const db = (0, connection_1.connectPostgres)();
        const transcriptionConsumer = new transcription_consumer_1.TranscriptionConsumer(mq, mongo);
        const marketingConsumer = new marketing_consumer_1.MarketingConsumer(mq, mongo, db);
        const imageConsumer = new image_consumer_1.ImageConsumer(mq, mongo);
        await transcriptionConsumer.start();
        await marketingConsumer.start();
        await imageConsumer.start();
        console.log('Listing service consumers started');
        app.listen(PORT, () => {
            console.log(`Listing service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start listing service:', error);
        process.exit(1);
    }
}
start();
