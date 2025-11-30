import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { AllEvents } from '../types/events';
import { Logger } from '../utils/logger';

export class RabbitMQClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private url: string;
  private logger: Logger;
  private exchangeName: string = 'travel_marketplace';

  constructor(url: string, serviceName: string = 'RabbitMQ') {
    this.url = url;
    this.logger = new Logger(serviceName);
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      
      // Declare exchange
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      
      this.logger.info('Connected to RabbitMQ');
      
      // Handle connection errors
      this.connection.on('error', (err: Error) => {
        this.logger.error('RabbitMQ connection error', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  async publish(topic: string, payload: any): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }

    try {
      await this.channel.publish(
        this.exchangeName,
        topic,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );
      this.logger.debug(`Published event: ${topic}`, payload);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${topic}`, error);
      throw error;
    }
  }

  async subscribe(
    topic: string,
    handler: (payload: any) => Promise<void>,
    queueName?: string
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }

    try {
      const queue = queueName 
        ? await this.channel.assertQueue(queueName, { durable: true })
        : await this.channel.assertQueue('', { exclusive: true });
      
      await this.channel.bindQueue(queue.queue, this.exchangeName, topic);

      this.logger.info(`Subscribed to topic: ${topic} on queue: ${queue.queue}`);

      await this.channel.consume(queue.queue, async (msg: ConsumeMessage | null) => {
        if (msg) {
          try {
            const payload = JSON.parse(msg.content.toString());
            this.logger.debug(`Received event: ${topic}`, payload);
            await handler(payload);
            this.channel!.ack(msg);
          } catch (error) {
            this.logger.error(`Error processing message from topic: ${topic}`, error);
            // Nack and don't requeue to avoid infinite loops
            this.channel!.nack(msg, false, false);
          }
        }
      });
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic: ${topic}`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.info('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error);
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

