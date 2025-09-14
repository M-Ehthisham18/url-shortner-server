// src/routes/auth.route.ts
import express from 'express';
import { ExpressAuth } from '@auth/express'; // ✅ Correct
import { authConfig } from '../lib/auth';
import { verifyEmail } from '../controllers/auth.controller';

const router = express.Router();

router.use(ExpressAuth(authConfig)); // ✅ Callable
// router.get('/verify-email',verifyEmail)

export default router;
