import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    dateTime: {
      type: Date,
      default: new Date(),
    },
  },
  { timeStamps: true }
);

export default mongoose.model("comment", commentSchema);
