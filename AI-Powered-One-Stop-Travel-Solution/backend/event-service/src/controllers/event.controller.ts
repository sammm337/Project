import { Router, Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { AppError } from '../../../shared/dist/utils/errors';

export const eventRouter = Router();
const eventService = new EventService();

// Initialize service on startup
eventService.initialize().catch(console.error);

eventRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      agencyId,
      title,
      description,
      location,
      startDate,
      endDate,
      price,
      totalSeats,
      tags
    } = req.body;

    const event = await eventService.createEvent({
      agencyId,
      title,
      description,
      location,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      price,
      totalSeats,
      tags
    });

    res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

eventRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    res.json({ success: true, data: event });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

eventRouter.post('/:id/book', async (req: Request, res: Response) => {
  try {
    // This endpoint will be proxied to booking-service
    // For now, just return a message
    res.json({ 
      success: true, 
      message: 'Booking request received. Please use POST /api/bookings endpoint.' 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

