import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User ID is required"],
  },
  type: {
    type: String,
    enum: ['bid_received', 'bid_accepted', 'bid_rejected', 'project_completed', 'milestone_completed', 'message_received', 'payment_received', 'review_received', 'project_confirmed', 'revision_requested', 'job_invitation', 'invitation_accepted', 'invitation_rejected'],
    required: [true, "Notification type is required"],
  },
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  message: {
    type: String,
    required: [true, "Message is required"],
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
  },
  relatedModel: {
    type: String,
    enum: ['PostJob', 'Bid', 'Message', 'Review', 'Milestone', 'Invitation'],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);