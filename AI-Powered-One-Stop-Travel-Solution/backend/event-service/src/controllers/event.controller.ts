import { Router, Request, Response } from 'express';
import { EventService } from '../services/event.service';
import { AppError } from '../../../shared/dist/utils/errors';

export const eventRouter = Router();
const eventService = new EventService();

// Initialize service on startup
eventService.initialize().catch(console.error);

eventRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const events = await eventService.listEvents();
    res.json({ success: true, data: events, events });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

eventRouter.post('/', async (req: Request, res: Response) => {
  try {
    const event = await eventService.createEventFromPayload(req.body);

    res.status(201).json({ success: true, data: event, event });
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
    const { id } = req.params;
    const booking = await eventService.bookEvent(id, req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

