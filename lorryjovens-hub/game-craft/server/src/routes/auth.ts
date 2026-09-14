import { Router } from 'express';
import { register, login, refreshToken, getProfile } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validators.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.get('/profile', authenticate, getProfile);

export default router;
