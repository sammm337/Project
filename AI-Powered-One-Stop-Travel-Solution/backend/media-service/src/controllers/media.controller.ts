import { Router, Request, Response } from 'express';
import multer from 'multer';
import { MediaService } from '../services/media.service';
import { AppError } from '../../../shared/dist/utils/errors';

export const mediaRouter = Router();
const mediaService = new MediaService();

// Configure Multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

mediaRouter.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
       res.status(400).json({ success: false, error: 'No file uploaded' });
       return; 
    }

    const url = await mediaService.uploadFile(req.file);
    res.json({ success: true, url });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

mediaRouter.get('/entity/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const media = await mediaService.getMediaByEntity(entityType, entityId);
    res.json({ success: true, data: media });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

mediaRouter.get('/:id/url', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // FIX: Removed the 'expiresIn' argument since the URL is now public
    const url = await mediaService.getMediaUrl(id);
    res.json({ success: true, data: { url } });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});