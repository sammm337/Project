declare module 'amqplib' {
  export interface ConsumeMessage {
    content: Buffer;
  }

  export interface Channel {
    assertExchange(exchange: string, type: string, options?: Record<string, any>): Promise<void>;
    publish(exchange: string, routingKey: string, content: Buffer, options?: Record<string, any>): boolean;
    assertQueue(queue: string, options?: Record<string, any>): Promise<{ queue: string }>;
    bindQueue(queue: string, source: string, pattern: string, args?: Record<string, any>): Promise<void>;
    consume(
      queue: string,
      onMessage: (msg: ConsumeMessage | null) => void,
      options?: Record<string, any>
    ): Promise<void>;
    ack(message: ConsumeMessage, allUpTo?: boolean): void;
    nack(message: ConsumeMessage, allUpTo?: boolean, requeue?: boolean): void;
    close(): Promise<void>;
  }

  export interface Connection {
    createChannel(): Promise<Channel>;
    on(event: 'error', listener: (err: Error) => void): void;
    on(event: 'close', listener: () => void): void;
    close(): Promise<void>;
  }

  export function connect(url: string): Promise<Connection>;

  const amqp: {
    connect: typeof connect;
  };

  export default amqp;
}



