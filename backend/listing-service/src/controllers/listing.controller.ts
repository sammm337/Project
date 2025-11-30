import { Router, Request, Response } from 'express';
import { ListingService } from '../services/listing.service';
import { AppError } from '../../../shared/dist/utils/errors';

export const listingRouter = Router();
const listingService = new ListingService();

// Initialize service on startup
listingService.initialize().catch(console.error);

listingRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const listing = await listingService.getListingById(id);
    res.json({ success: true, data: listing });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

listingRouter.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      city: req.query.city as string,
      min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
      max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      near: req.query.near as string,
      radius_km: req.query.radius_km ? parseFloat(req.query.radius_km as string) : undefined
    };

    const listings = await listingService.searchListings(filters);
    res.json({ success: true, data: listings });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

listingRouter.post('/publish/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const listing = await listingService.publishListing(id);
    res.json({ success: true, data: listing });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

