import mongoose,{Schema} from "mongoose";
const postJobSchema = new Schema({
  title: String,
  description: String,
  budget: Number,
  deadline: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed'],
    default: 'pending',
  },
  clientConfirmed: {
    type: Boolean,
    default: false,
  }
});


export const PostJob = mongoose.models.PostJob || mongoose.model("PostJob", postJobSchema);
