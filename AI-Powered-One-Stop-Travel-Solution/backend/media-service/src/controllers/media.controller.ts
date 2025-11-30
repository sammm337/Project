import { Router, Request, Response } from 'express';
import { MediaService } from '../services/media.service';
import { AppError } from '../../../shared/dist/utils/errors';

export const mediaRouter = Router();
const mediaService = new MediaService();

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
    const expiresIn = req.query.expiresIn ? parseInt(req.query.expiresIn as string) : 3600;
    const url = await mediaService.getMediaUrl(id, expiresIn);
    res.json({ success: true, data: { url } });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

