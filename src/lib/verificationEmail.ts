// src/lib/sendVerificationEmail.ts
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/user.model";

const VERIFICATION_TOKEN_EXPIRY = 1000 * 60 * 10; // 10mins
const RESET_PASSWORD_TOKEN_EXPIRY = 1000 * 60 * 5; // 10mins

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Send verification email function
export async function sendVerificationEmail({
  email,
  type,
}: {
  email: string;
  type: string;
}) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  const token = generateVerificationToken();

  if (type === "emailVerification") {
    user.verificationToken = token;
    user.verificationTokenExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY
    ); // 10 mins expiration
  } else if (type === "requestPasswordReset") {
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(
      Date.now() + RESET_PASSWORD_TOKEN_EXPIRY
    );
  }
  await user.save();

  // const verificationUrl = `http://localhost:4000/api/verify-email?token=${token}&email=${email}`;

  const urlPath =
    type === "emailVerification"
      ? `http://localhost:4000/api/verify-email?token=${token}&email=${email}`
      : `http://localhost:4000/api/reset-password?token=${token}&email=${email}`;
// `http://localhost:3000/reset-password?token=${token}&email=${email}`
  const subject =
    type === "emailVerification" ? `Verify Your Email` : `Reset Your Password`;

  const message =
    type === "emailVerification"
      ? `Click <a target="_blank" href="${urlPath}">here</a> to verify your email address.`
      : `Click <a target="_blank" href="${urlPath}">here</a> to reset your password.`;

  // Use nodemailer to send the email
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use 'true' for port 465, 'false' for 587
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your App Password
    },
  });

  await transporter.sendMail({
    from: '"URL Shortener" <statusk249@gmail.com>',
    to: email,
    subject,
    html: `<p>${message}</p>`,
  });
}
