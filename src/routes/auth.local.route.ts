// src/routes/auth.local.route.ts
import express from 'express';
import { signup, signin, logout, profile, requestPasswordReset, resetPassword, verifyEmail } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.guard';

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
// router.post('/logout', logout);
router.get('/profile',requireAuth, profile);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/verify-email',verifyEmail)

export default router;
