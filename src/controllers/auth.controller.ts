import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import crypto from 'crypto';
import { sendVerificationEmail } from '../lib/verificationEmail';


const SALT_ROUNDS = 10;

// POST /auth/signup
export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    sendVerificationEmail({email,type:"emailVerification"})

    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// POST /auth/signin
export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    // Just return success message for now (Auth.js handles session separately)
    return res.status(200).json({ message: 'Login successful. Use /auth/callback/credentials to sign in via Auth.js' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  // Clear the Auth.js session cookie (default name is 'next-auth.session-token' or '__Secure-next-auth.session-token')
  res.clearCookie('next-auth.session-token', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  // Also clear secure cookie version if exists (for HTTPS in prod)
  res.clearCookie('__Secure-next-auth.session-token', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};

export const profile = async (req: Request, res: Response) => {
  const user = (req as any).user;

  res.json({
    message: 'This is a protected profile route',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  sendVerificationEmail({email,type:"requestPasswordReset"})

  res.json({ message: 'Password reset token generated and sent to email (check server logs here).' });

  return 
}
// You store the token and email in component state, and do not ask the user to input it.
export const resetPassword =async (req: Request, res:Response) => {
  const {email, token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

  const user = await User.findOne({
    email,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }, // token not expired
  });

  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

  // Hash new password and update
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  // Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json({ message: 'Password has been reset successfully.' });
}

export const verifyEmail = async (req:Request, res:Response) => {
  const { token, email } = req.query;

  if (!token || !email) return res.status(400).send('Invalid verification link.');

  const user = await User.findOne({
    email,
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() }, // check token not expired 
  });

  if (!user) return res.status(400).send('Invalid or expired verification token.');

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  await user.save();

  // Redirect to login page or dashboard
  res.send('Email verified successfully! You can now log in.');
}
