import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { VendorService } from '../services/vendor.service';
import { AppError } from '../../../shared/dist/utils/errors';

// 1. Configure Multer (Simple disk storage for now)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ideally this should map to a shared volume or temp dir
    cb(null, '/tmp'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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

// 2. Add Multer Middleware to route
const uploadFields = upload.fields([
  { name: 'audio', maxCount: 1 }, 
  { name: 'images', maxCount: 10 }
]);

vendorRouter.post('/create-package', uploadFields, async (req: Request, res: Response) => {
  try {
    const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Only process images since you disabled audio
    const filePaths: string[] = [];
    if (filesMap['images']) {
      filesMap['images'].forEach(f => filePaths.push(f.path));
    }

    // Extract fields
    const { vendorId, price, title, description, location: locationStr } = req.body;
    
    // Parse location
    let location = { city: 'Unknown' };
    if (locationStr) {
      try {
        location = JSON.parse(locationStr);
      } catch (e) {
        console.error('Failed to parse location JSON', e);
      }
    }

    // UPDATE: Pass title and description to the service
    const result = await vendorService.createPackage(
      vendorId, 
      filePaths, 
      Number(price), 
      location, 
      title, 
      description
    );

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Upload Error:', error);
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