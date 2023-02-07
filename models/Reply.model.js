import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    commentId: {
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

export default mongoose.model("CommentReply", replySchema);
