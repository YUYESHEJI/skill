import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', (_req, res) => {
  res.json({ message: 'Projects endpoint - coming soon' });
});

router.post('/', (_req, res) => {
  res.json({ message: 'Create project - coming soon' });
});

router.get('/:id', (_req, res) => {
  res.json({ message: 'Get project - coming soon' });
});

export default router;
