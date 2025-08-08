import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name Required"],
  },
  email: {
    type: String,
    required: [true, "Email Required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password Required"],
  },
  role: {
    type: String,
    enum: ["client", "freelancer", "admin"],
    required: [true, "Role Required"],
  },
  walletAddress: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  skills: {
    type: [String],
    default: [],
  },
  hourlyRate: {
    type: Number,
    default: 0,
  },
  profileImage: {
    type: String,
    default: "/default-avatar.png",
  },
  badges: {
    type: [String],
    default: [],
  },
  favoriteJobs: {
    type: [Schema.Types.ObjectId],
    ref: "PostJob",
    default: [],
  },
  transactionHistory: {
    type: [
      {
        amount: Number,
        type: String,
        date: Date,
        description: String,
      },
    ],
    default: [],
  },
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);