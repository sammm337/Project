import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../../../shared/dist/utils/errors';

export const authRouter = Router();
const authService = new AuthService();

authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;
    const user = await authService.signup(email, password, full_name);
    res.status(201).json({
      success: true,
      data: { user: { id: user.id, email: user.email, full_name: user.full_name } }
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
});

