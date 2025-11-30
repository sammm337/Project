"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const search_controller_1 = require("./controllers/search.controller");
const connection_1 = require("./db/connection");
const client_1 = require("../../shared/dist/rabbitmq/client");
const vector_service_1 = require("./services/vector.service");
const embedding_consumer_1 = require("./consumers/embedding.consumer");
const listing_consumer_1 = require("./consumers/listing.consumer");
const event_consumer_1 = require("./consumers/event.consumer");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3007;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/search', search_controller_1.searchRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'search-service' });
});
async function start() {
    try {
        // Initialize consumers
        const mq = new client_1.RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'search-service');
        await mq.connect();
        await (0, connection_1.connectMongo)();
        const vectorService = new vector_service_1.VectorService();
        const embeddingConsumer = new embedding_consumer_1.EmbeddingConsumer(mq, vectorService);
        const listingConsumer = new listing_consumer_1.ListingConsumer(mq, vectorService);
        const eventConsumer = new event_consumer_1.EventConsumer(mq, vectorService);
        await embeddingConsumer.start();
        await listingConsumer.start();
        await eventConsumer.start();
        console.log('Search service consumers started');
        app.listen(PORT, () => {
            console.log(`Search service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start search service:', error);
        process.exit(1);
    }
}
start();
