"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRouter = void 0;
const express_1 = require("express");
const event_service_1 = require("../services/event.service");
const errors_1 = require("../../../shared/dist/utils/errors");
exports.eventRouter = (0, express_1.Router)();
const eventService = new event_service_1.EventService();
// Initialize service on startup
eventService.initialize().catch(console.error);
exports.eventRouter.get('/', async (_req, res) => {
    try {
        const events = await eventService.listEvents();
        res.json({ success: true, data: events, events });
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
exports.eventRouter.post('/', async (req, res) => {
    try {
        const event = await eventService.createEventFromPayload(req.body);
        res.status(201).json({ success: true, data: event, event });
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
exports.eventRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const event = await eventService.getEventById(id);
        res.json({ success: true, data: event });
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
exports.eventRouter.post('/:id/book', async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await eventService.bookEvent(id, req.body);
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
