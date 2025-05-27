import mongoose,{Schema} from "mongoose";
const postJobSchema = new Schema({
  title: String,
  description: String,
  budget: Number,
  deadline: Date,
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'users',
}

});

export const PostJob = mongoose.models.PostJob || mongoose.model("PostJob", postJobSchema);
