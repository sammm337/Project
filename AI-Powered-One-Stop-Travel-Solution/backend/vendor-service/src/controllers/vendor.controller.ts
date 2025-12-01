import { Router, Request, Response } from 'express';
import { VendorService } from '../services/vendor.service';
import { AppError } from '../../../shared/dist/utils/errors';

export const vendorRouter = Router();
const vendorService = new VendorService();

// Initialize service on startup
vendorService.initialize().catch(console.error);

vendorRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const { userId, business_name, whatsapp_number, location } = req.body;
    const vendor = await vendorService.createVendor(userId, business_name, whatsapp_number, location);
    res.status(201).json({ success: true, data: vendor });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

vendorRouter.post('/create-package', async (req: Request, res: Response) => {
  try {
    const { vendorId, files, price, location, raw_text } = req.body;
    const result = await vendorService.createPackage(vendorId, files, price, location, raw_text);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

vendorRouter.put('/update-package/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await vendorService.updatePackage(id, updates);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

vendorRouter.get('/packages/:vendorId', async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const packages = await vendorService.getPackages(vendorId);
    res.json({ success: true, data: packages });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

vendorRouter.post('/generate-metadata', async (req: Request, res: Response) => {
  try {
    const { vendorId, listingId } = req.body;
    const metadata = await vendorService.generateMetadata(vendorId, listingId);
    res.json({ success: true, data: metadata });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

