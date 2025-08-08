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
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  clientConfirmed: {
    type: Boolean,
    default: false,
  },
  submissionFile: {
  type: String,
  default: '',
},
  image: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: '',
  },
  subcategory: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  jobType: {
    type: String,
    default: '',
  },
  basicBudget: {
    type: Number,
    default: 0,
  },
  expertBudget: {
    type: Number,
    default: 0,
  },
  additionalRequirements: {
    type: String,
    default: '',
  },
  attachments: [{
    type: String,
    default: '',
  }],
  completionNotes: {
    type: String,
    default: '',
  },
  completedAt: {
    type: Date,
    default: null,
  },
  clientFeedback: {
    type: String,
    default: '',
  },
}, {
  timestamps: true
});


export const PostJob = mongoose.models.PostJob || mongoose.model("PostJob", postJobSchema);
