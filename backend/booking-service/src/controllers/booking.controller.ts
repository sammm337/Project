import { Router, Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { AppError } from '../../../shared/dist/utils/errors';

export const bookingRouter = Router();
const bookingService = new BookingService();

// Initialize service on startup
bookingService.initialize().catch(console.error);

bookingRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, eventId, listingId, seats, total_amount } = req.body;
    const booking = await bookingService.createBooking(userId, eventId, listingId, seats, total_amount);
    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

bookingRouter.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const bookings = await bookingService.getUserBookings(userId);
    res.json({ success: true, data: bookings });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

