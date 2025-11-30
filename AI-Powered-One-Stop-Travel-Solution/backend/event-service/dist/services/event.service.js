"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const connection_1 = require("../db/connection");
const client_1 = require("../../../shared/dist/rabbitmq/client");
const errors_1 = require("../../../shared/dist/utils/errors");
class EventService {
    constructor() {
        this.db = (0, connection_1.connectDB)();
        this.mq = new client_1.RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'event-service');
    }
    async initialize() {
        await this.mq.connect();
    }
    async createEvent(data) {
        if (!data.title || !data.agencyId || !data.location) {
            throw new errors_1.ValidationError('Title, agencyId, and location are required');
        }
        if (data.totalSeats <= 0) {
            throw new errors_1.ValidationError('Total seats must be greater than 0');
        }
        const result = await this.db.query(`INSERT INTO events (agency_id, title, description, location, start_date, end_date, price, total_seats, available_seats, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`, [
            data.agencyId,
            data.title,
            data.description,
            JSON.stringify(data.location),
            data.startDate,
            data.endDate || null,
            data.price,
            data.totalSeats,
            data.totalSeats, // Initially all seats are available
            data.tags || []
        ]);
        const event = result.rows[0];
        // Publish event.created event
        const eventCreated = {
            topic: 'event.created',
            payload: {
                eventId: event.id,
                agencyId: data.agencyId,
                title: data.title,
                description: data.description,
                location: data.location,
                startDate: data.startDate.toISOString(),
                price: data.price,
                tags: data.tags || [],
                embeddingId: event.embedding_id
            }
        };
        await this.mq.publish('event.created', eventCreated.payload);
        return event;
    }
    async getEventById(id) {
        const result = await this.db.query(`SELECT e.*, a.business_name as agency_name 
       FROM events e 
       LEFT JOIN agencies a ON e.agency_id = a.id 
       WHERE e.id = $1`, [id]);
        if (result.rows.length === 0) {
            throw new errors_1.NotFoundError('Event');
        }
        return result.rows[0];
    }
}
exports.EventService = EventService;
