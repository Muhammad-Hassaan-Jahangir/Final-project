import mongoose, { Schema } from "mongoose";

const milestoneSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  description: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  deadline: {
    type: Date,
    required: [true, "Deadline is required"],
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostJob',
    required: [true, "Project ID is required"],
  },
  amount: {
    type: Number,
    default: 0,
  },
  submissionFile: {
    type: String,
  },
  submissionNotes: {
    type: String,
  },
  submittedAt: {
    type: Date,
  },
  approvedAt: {
    type: Date,
  },
  // Blockchain related fields
  blockchainId: {
    type: String,
  },
  transactionHash: {
    type: String,
  },
  blockchainCompletionTx: {
    type: String,
  },
  useBlockchain: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Milestone = mongoose.models.Milestone || mongoose.model("Milestone", milestoneSchema);