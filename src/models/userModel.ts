import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name Required"],
  },
  email: {
    type: String,
    required: [true, "Email Required"],
    unique: true,  // <-- add this to enforce unique emails
  },
  password: {
    type: String,
    required: [true, "Password Required"],
  },
  role: {
    type: String,
    enum: ['freelancer', 'client', 'admin'], // add more roles if needed
    required: true,
  },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },

});

export const User = mongoose.models.users || mongoose.model("users", userSchema);
