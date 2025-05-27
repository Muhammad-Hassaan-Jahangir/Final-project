// services/forgotpasswordservice.ts
import {User} from "../models/userModel";  // apni User model
import crypto from "crypto";
import bcrypt from "bcrypt";
import sendEmail from "../helper/sendEmail";

export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(resetToken, 10);

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins expiry
  await user.save();

  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  const message = `Password reset ke liye click karo: ${resetUrl}`;

  await sendEmail(user.email, "Password Reset", message);

  return "Reset password email sent successfully";
};

