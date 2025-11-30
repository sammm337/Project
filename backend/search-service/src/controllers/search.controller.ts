import { Router, Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { AppError } from '../../../shared/dist/utils/errors';

export const searchRouter = Router();
const searchService = new SearchService();

// Initialize service on startup
searchService.initialize().catch(console.error);

searchRouter.post('/semantic', async (req: Request, res: Response) => {
  try {
    const { q, filters, mode } = req.body;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query string is required' });
    }

    const results = await searchService.semanticSearch(q, filters || {}, mode || 'via_vendor');
    res.json({ success: true, data: results });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

