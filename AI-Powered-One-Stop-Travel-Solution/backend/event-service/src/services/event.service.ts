import { Pool } from 'pg';
import { connectDB } from '../db/connection';
import { RabbitMQClient } from '../../../shared/dist/rabbitmq/client';
import { EventCreatedEvent } from '../../../shared/dist/types/events';
import { NotFoundError, ValidationError } from '../../../shared/dist/utils/errors';

export class EventService {
  private db: Pool;
  private mq: RabbitMQClient;

  constructor() {
    this.db = connectDB();
    this.mq = new RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'event-service');
  }

  async initialize() {
    await this.mq.connect();
  }

  async createEvent(data: {
    agencyId: string;
    title: string;
    description: string;
    location: any;
    startDate: Date;
    endDate?: Date;
    price: number;
    totalSeats: number;
    tags?: string[];
  }) {
    if (!data.title || !data.agencyId || !data.location) {
      throw new ValidationError('Title, agencyId, and location are required');
    }

    if (data.totalSeats <= 0) {
      throw new ValidationError('Total seats must be greater than 0');
    }

    const result = await this.db.query(
      `INSERT INTO events (agency_id, title, description, location, start_date, end_date, price, total_seats, available_seats, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
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
      ]
    );

    const event = result.rows[0];

    // Publish event.created event
    const eventCreated: EventCreatedEvent = {
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

  async getEventById(id: string) {
    const result = await this.db.query(
      `SELECT e.*, a.business_name as agency_name 
       FROM events e 
       LEFT JOIN agencies a ON e.agency_id = a.id 
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Event');
    }

    return result.rows[0];
  }
}

