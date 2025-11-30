"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const connection_1 = require("../db/connection");
const client_1 = require("../../../shared/dist/rabbitmq/client");
const errors_1 = require("../../../shared/dist/utils/errors");
const payment_service_1 = require("./payment.service");
class BookingService {
    constructor() {
        this.db = (0, connection_1.connectDB)();
        this.mq = new client_1.RabbitMQClient(process.env.RABBITMQ_URL || 'amqp://localhost:5672', 'booking-service');
        this.paymentService = new payment_service_1.PaymentService();
    }
    async initialize() {
        await this.mq.connect();
    }
    async createBooking(userId, eventId, listingId, seats, totalAmount) {
        if (!eventId && !listingId) {
            throw new errors_1.ValidationError('Either eventId or listingId must be provided');
        }
        if (seats <= 0) {
            throw new errors_1.ValidationError('Seats must be greater than 0');
        }
        if (totalAmount <= 0) {
            throw new errors_1.ValidationError('Total amount must be greater than 0');
        }
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            // If booking an event, reserve seats with row-level locking
            if (eventId) {
                const eventResult = await client.query('SELECT available_seats, total_seats FROM events WHERE id = $1 FOR UPDATE', [eventId]);
                if (eventResult.rows.length === 0) {
                    throw new errors_1.NotFoundError('Event');
                }
                const { available_seats } = eventResult.rows[0];
                if (available_seats < seats) {
                    throw new errors_1.ValidationError(`Not enough seats available. Only ${available_seats} seats remaining.`);
                }
                // Decrement available seats atomically
                await client.query('UPDATE events SET available_seats = available_seats - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [seats, eventId]);
            }
            // Create booking record
            const bookingResult = await client.query(`INSERT INTO bookings (user_id, event_id, listing_id, seats, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`, [userId, eventId, listingId, seats, totalAmount]);
            const booking = bookingResult.rows[0];
            // Process payment
            const payment = await this.paymentService.processPayment(booking.id, totalAmount, client);
            if (payment.status === 'succeeded') {
                // Update booking status to confirmed
                await client.query('UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['confirmed', booking.id]);
                booking.status = 'confirmed';
                // Publish events
                const bookingEvent = {
                    topic: 'booking.created',
                    payload: {
                        bookingId: booking.id,
                        userId,
                        eventId: eventId || undefined,
                        listingId: listingId || undefined,
                        seats,
                        totalAmount
                    }
                };
                await this.mq.publish('booking.created', bookingEvent.payload);
                const paymentEvent = {
                    topic: 'payment.succeeded',
                    payload: {
                        paymentId: payment.id,
                        bookingId: booking.id,
                        amount: totalAmount,
                        transactionId: payment.transaction_id
                    }
                };
                await this.mq.publish('payment.succeeded', paymentEvent.payload);
            }
            else {
                // Payment failed - rollback seat reservation
                if (eventId) {
                    await client.query('UPDATE events SET available_seats = available_seats + $1 WHERE id = $2', [seats, eventId]);
                }
                booking.status = 'payment_failed';
            }
            await client.query('COMMIT');
            return booking;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getUserBookings(userId) {
        const result = await this.db.query(`SELECT b.*, 
              e.title as event_title, e.start_date as event_start_date,
              l.title as listing_title, l.price as listing_price
       FROM bookings b
       LEFT JOIN events e ON b.event_id = e.id
       LEFT JOIN listings l ON b.listing_id = l.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`, [userId]);
        return result.rows;
    }
}
exports.BookingService = BookingService;
