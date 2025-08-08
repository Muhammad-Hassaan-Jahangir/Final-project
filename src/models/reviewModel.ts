import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostJob',
    required: [true, "Project ID is required"],
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Reviewer ID is required"],
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Reviewee ID is required"],
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, "Comment is required"],
  },
  reviewType: {
    type: String,
    enum: ['client_to_freelancer', 'freelancer_to_client'],
    required: [true, "Review type is required"],
  },
  helpful: {
    type: Number,
    default: 0,
  },
  skills: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);