add zod for extra safe input

import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async authorize(credentials) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}


## ** singIn page will look like this
import { signIn, getCsrfToken } from "next-auth/react";

export default function SignIn({ csrfToken }) {
  return (
    <form method="post" action="/api/auth/callback/credentials">
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
      <label>
        Email
        <input name="email" type="text" />
      </label>
      <label>
        Password
        <input name="password" type="password" />
      </label>
      <button type="submit">Sign in</button>
    </form>
  );
}

// Fetch CSRF token server-side for the form
export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}


## in case redirect to a base url use this in /lib/auth.ts
async redirect({ url, baseUrl }) {
      // If the redirect URL is within your site, redirect there
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Otherwise, redirect to your dashboard page
      return baseUrl + '/dashboard';
    }

## in password reset do not ask these fields with user

Step 2: Frontend (e.g. React) parses token from the URL

Use JavaScript to grab the token and email:

// ResetPassword.tsx or ResetPasswordPage.tsx
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const email = params.get("email");

When user submits new password, you include the token behind the scenes:
await fetch('/api/reset-password', {
  method: 'POST',
  body: JSON.stringify({
    token,
    email, // optional depending on your backend
    newPassword: passwordInputValue,
  }),
  headers: {
    'Content-Type': 'application/json',
  },
});

You store the token and email in component state, and do not ask the user to input it.



















// src/lib/sendVerificationEmail.ts 
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/user.model';


const VERIFICATION_TOKEN_EXPIRY = 1000 * 60 * 10; // 10mins

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send verification email function
export async function sendVerificationEmail(email:string) {
  const user = await User.findOne({email})
  if(!user) throw new Error('User not found');
  const token = generateVerificationToken();

  user.verificationToken = token;
  user.verificationTokenExpires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY); // 1 hour expiration
  await user.save();

  const verificationUrl = `http://localhost:4000/api/verify-email?token=${token}&email=${email}`;

  // Use nodemailer to send the email
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use 'true' for port 465, 'false' for 587
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your App Password
    },
  });

  await transporter.sendMail({
    from: '"URL Shortener" <statusk249@gmail.com>',
    to: user?.email,
    subject: 'Verify Your Email',
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`,
  });
}



// POST /auth/signup
export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    sendVerificationEmail(email)

    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
