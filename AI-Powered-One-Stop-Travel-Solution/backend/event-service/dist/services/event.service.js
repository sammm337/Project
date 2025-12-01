"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const connection_1 = require("../db/connection");
const client_1 = require("../../../shared/dist/rabbitmq/client");
const errors_1 = require("../../../shared/dist/utils/errors");
class EventService {
    constructor() {
        this.defaultAgencyCache = new Map();
        this.guestUserId = null;
        this.db = (0, connection_1.connectDB)();
        this.mq = new client_1.RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'event-service');
        this.bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://booking-service:3006';
    }
    async initialize() {
        await this.mq.connect();
    }
    async createEventFromPayload(payload) {
        const normalized = await this.normalizeCreatePayload(payload);
        return this.createEvent(normalized);
    }
    async createEvent(data) {
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
            data.totalSeats,
            data.tags || []
        ]);
        const event = result.rows[0];
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
    async listEvents(limit = 50) {
        const result = await this.db.query(`SELECT id, title, description, location, start_date, price, tags, total_seats, available_seats
       FROM events
       ORDER BY start_date ASC
       LIMIT $1`, [limit]);
        return result.rows.map((row) => {
            const location = typeof row.location === 'string' ? JSON.parse(row.location) : row.location || {};
            return {
                id: row.id,
                title: row.title,
                summary: row.description,
                location,
                city: location.city ?? location.city_name ?? 'Unknown',
                date: row.start_date,
                price: Number(row.price),
                capacity: row.total_seats,
                availableSeats: row.available_seats,
                tags: row.tags || []
            };
        });
    }
    async bookEvent(eventId, payload) {
        const event = await this.getEventById(eventId);
        const seats = this.ensurePositiveNumber(payload?.guests, 1);
        const userId = payload?.userId || (await this.ensureGuestUser(payload?.name));
        const totalAmount = Number(event.price) * seats;
        const response = await fetch(`${this.bookingServiceUrl}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                eventId,
                listingId: null,
                seats,
                total_amount: totalAmount
            })
        });
        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new errors_1.ValidationError(data.error || 'Unable to create booking');
        }
        return data;
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
    async normalizeCreatePayload(payload) {
        if (!payload || typeof payload !== 'object') {
            throw new errors_1.ValidationError('Invalid event payload');
        }
        const title = String(payload.title ?? '').trim();
        if (!title) {
            throw new errors_1.ValidationError('Title is required');
        }
        const rawStartDate = payload.startDate ?? payload.date ?? new Date().toISOString();
        const startDate = new Date(rawStartDate);
        if (Number.isNaN(startDate.getTime())) {
            throw new errors_1.ValidationError('Invalid event date');
        }
        const endDate = payload.endDate ? new Date(payload.endDate) : undefined;
        if (endDate && Number.isNaN(endDate.getTime())) {
            throw new errors_1.ValidationError('Invalid event end date');
        }
        const price = this.ensurePositiveNumber(payload.price, 0);
        const totalSeats = this.ensurePositiveNumber(payload.totalSeats ?? payload.capacity, 20);
        if (totalSeats <= 0) {
            throw new errors_1.ValidationError('Total seats must be greater than 0');
        }
        const location = this.buildLocation(payload.location, payload.city);
        const agencyId = payload.agencyId || (await this.ensureDefaultAgency(location.city));
        return {
            agencyId,
            title,
            description: payload.description ?? payload.summary ?? '',
            location,
            startDate,
            endDate,
            price,
            totalSeats,
            tags: this.parseTags(payload.tags)
        };
    }
    parseTags(input) {
        if (Array.isArray(input)) {
            return input.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 10);
        }
        if (typeof input === 'string') {
            return input
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .slice(0, 10);
        }
        return [];
    }
    buildLocation(rawLocation, fallbackCity) {
        if (rawLocation && typeof rawLocation === 'object') {
            return rawLocation;
        }
        const city = typeof rawLocation === 'string' ? rawLocation : fallbackCity;
        return {
            city: city || 'Unknown',
            label: city || 'Unknown'
        };
    }
    ensurePositiveNumber(value, fallback) {
        const parsed = typeof value === 'number' ? value : value !== undefined ? Number(value) : Number.NaN;
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
        return fallback;
    }
    async ensureDefaultAgency(city) {
        const key = (city || 'general').toLowerCase();
        if (this.defaultAgencyCache.has(key)) {
            return this.defaultAgencyCache.get(key);
        }
        const friendlyName = city ? `Demo Agency - ${city}` : 'Demo Agency';
        const existing = await this.db.query('SELECT id FROM agencies WHERE business_name = $1 LIMIT 1', [friendlyName]);
        if (existing.rows.length > 0) {
            const agencyId = existing.rows[0].id;
            this.defaultAgencyCache.set(key, agencyId);
            return agencyId;
        }
        const inserted = await this.db.query(`INSERT INTO agencies (business_name, whatsapp_number, location)
       VALUES ($1, $2, $3)
       RETURNING id`, [friendlyName, '0000000000', JSON.stringify({ city: city || 'Unknown' })]);
        const agencyId = inserted.rows[0].id;
        this.defaultAgencyCache.set(key, agencyId);
        return agencyId;
    }
    async ensureGuestUser(name) {
        if (this.guestUserId) {
            return this.guestUserId;
        }
        const email = 'guest@travel.local';
        const existing = await this.db.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
        if (existing.rows.length > 0) {
            const userId = String(existing.rows[0].id);
            this.guestUserId = userId;
            return userId;
        }
        const created = await this.db.query(`INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`, [email, 'guest', name || 'Guest Booker', 'traveler']);
        const userId = String(created.rows[0].id);
        this.guestUserId = userId;
        return userId;
    }
}
exports.EventService = EventService;
