"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRouter = void 0;
const express_1 = require("express");
const booking_service_1 = require("../services/booking.service");
const errors_1 = require("../../../shared/dist/utils/errors");
exports.bookingRouter = (0, express_1.Router)();
const bookingService = new booking_service_1.BookingService();
// Initialize service on startup
bookingService.initialize().catch(console.error);
exports.bookingRouter.post('/', async (req, res) => {
    try {
        const { userId, eventId, listingId, seats, total_amount } = req.body;
        const booking = await bookingService.createBooking(userId, eventId, listingId, seats, total_amount);
        res.status(201).json({ success: true, data: booking });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ success: false, error: error.message });
        }
        else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});
exports.bookingRouter.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await bookingService.getUserBookings(userId);
        res.json({ success: true, data: bookings });
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({ success: false, error: error.message });
        }
        else {
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
});
