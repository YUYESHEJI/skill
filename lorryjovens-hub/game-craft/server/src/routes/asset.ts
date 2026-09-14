import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', (_req, res) => {
  res.json({ message: 'List assets - coming soon' });
});

router.get('/:id', (_req, res) => {
  res.json({ message: 'Get asset - coming soon' });
});

export default router;
