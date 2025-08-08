import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostJob',
    required: [true, "Project ID is required"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User ID is required"],
  },
  comment: {
    type: String,
    required: [true, "Comment is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);