"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQClient = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const logger_1 = require("../utils/logger");
class RabbitMQClient {
    constructor(url, serviceName = 'RabbitMQ') {
        this.connection = null;
        this.channel = null;
        this.exchangeName = 'travel_marketplace';
        this.url = url;
        this.logger = new logger_1.Logger(serviceName);
    }
    async connect() {
        try {
            this.connection = await amqplib_1.default.connect(this.url);
            this.channel = await this.connection.createChannel();
            // Declare exchange
            await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
            this.logger.info('Connected to RabbitMQ');
            // Handle connection errors
            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ connection error', err);
            });
            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed');
            });
        }
        catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error);
            throw error;
        }
    }
    async publish(topic, payload) {
        if (!this.channel) {
            throw new Error('Not connected to RabbitMQ');
        }
        try {
            await this.channel.publish(this.exchangeName, topic, Buffer.from(JSON.stringify(payload)), { persistent: true });
            this.logger.debug(`Published event: ${topic}`, payload);
        }
        catch (error) {
            this.logger.error(`Failed to publish event: ${topic}`, error);
            throw error;
        }
    }
    async subscribe(topic, handler, queueName) {
        if (!this.channel) {
            throw new Error('Not connected to RabbitMQ');
        }
        try {
            const queue = queueName
                ? await this.channel.assertQueue(queueName, { durable: true })
                : await this.channel.assertQueue('', { exclusive: true });
            await this.channel.bindQueue(queue.queue, this.exchangeName, topic);
            this.logger.info(`Subscribed to topic: ${topic} on queue: ${queue.queue}`);
            await this.channel.consume(queue.queue, async (msg) => {
                if (msg) {
                    try {
                        const payload = JSON.parse(msg.content.toString());
                        this.logger.debug(`Received event: ${topic}`, payload);
                        await handler(payload);
                        this.channel.ack(msg);
                    }
                    catch (error) {
                        this.logger.error(`Error processing message from topic: ${topic}`, error);
                        // Nack and don't requeue to avoid infinite loops
                        this.channel.nack(msg, false, false);
                    }
                }
            });
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to topic: ${topic}`, error);
            throw error;
        }
    }
    async close() {
        try {
            if (this.channel)
                await this.channel.close();
            if (this.connection)
                await this.connection.close();
            this.logger.info('RabbitMQ connection closed');
        }
        catch (error) {
            this.logger.error('Error closing RabbitMQ connection', error);
        }
    }
    isConnected() {
        return this.connection !== null && this.channel !== null;
    }
}
exports.RabbitMQClient = RabbitMQClient;
