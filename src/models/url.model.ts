import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface for User
export interface IUser extends Document {
  shortUrl: string;
  redirectUrl: string;
}

// Define schema
const urlSchema = new Schema<IUser>(
  {
    shortUrl: {
      type: String,
      required: true,
      unique: true,
    },
    redirectUrl: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// Create model
const URL = mongoose.model<IUser>("URL", urlSchema);

export default URL;
