import mongoose from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isVerified?: boolean;
  verificationToken?: String,                        // <--- new
  verificationTokenExpires?: Date 
  image: String;
  // other fields...
}

const userSchema = new mongoose.Schema<IUser>({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,                        // <--- new
  verificationTokenExpires: Date ,
  image: String,
});

const User = mongoose.model("User", userSchema);

export default User;
