import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/frames', (_req, res) => {
  res.json({ message: 'Generate frames - coming soon' });
});

router.post('/assets', (_req, res) => {
  res.json({ message: 'Generate assets - coming soon' });
});

router.get('/tasks/:id', (_req, res) => {
  res.json({ message: 'Get task status - coming soon' });
});

export default router;
