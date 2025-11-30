export declare class RabbitMQClient {
    private connection;
    private channel;
    private url;
    private logger;
    private exchangeName;
    constructor(url: string, serviceName?: string);
    connect(): Promise<void>;
    publish(topic: string, payload: any): Promise<void>;
    subscribe(topic: string, handler: (payload: any) => Promise<void>, queueName?: string): Promise<void>;
    close(): Promise<void>;
    isConnected(): boolean;
}
