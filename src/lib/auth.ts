// src/lib/auth.ts
import type { AuthConfig } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import User from '../models/user.model'; // using named export
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from './verificationEmail';

export const authConfig: AuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
  const { email, password } = credentials as { email: string; password: string };

  if (!email || !password) return null;

  const user = await User.findOne({ email });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;
  
  if (!user.isVerified) {
    // Check if token expired (or missing)
    if (!user.verificationTokenExpires || user.verificationTokenExpires.getTime() < Date.now()) {
      await sendVerificationEmail({email, type : "emailVerification"});
      // throw new Error('Email not verified. Verification email resent.');
      console.log("check email");
      
      return null;
    }
    // throw new Error('Email not verified. Check your email.');
    console.log("resend email to verify");
    
    return null //-> change when email is added
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}
})
  ],
  // <-- Custom sign-in page path here
  // pages: {
  //   signIn: '/auth/signin',  // /pages/auth/signin.tsx 
  // signOut: '/auth/signout', // custom signout page (optional)
  // error: '/auth/error',     // error page (optional)
  // },
  session: {
    strategy: 'jwt',
     maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;          // user.id is a string, safe here
      token.email = user.email;
    }
    return token;
  },
  async session({ session, token }) {
    session.user = {
      ...session.user,
      id: token.id as string,      // <--- cast here to string
    };

    return session;
  },

  // this is connected to pages above
  // async redirect({ url, baseUrl }) {
  //     // If the redirect URL is within your site, redirect there
  //     if (url.startsWith(baseUrl)) {
  //       return url;
  //     }
  //     // Otherwise, redirect to your dashboard page
  //     return baseUrl + '/dashboard';
  //   }
}
};
