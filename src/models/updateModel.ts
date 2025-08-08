import mongoose, { Schema } from "mongoose";

const updateSchema = new Schema({
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
  content: {
    type: String,
    required: [true, "Update content is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Update = mongoose.models.Update || mongoose.model("Update", updateSchema);