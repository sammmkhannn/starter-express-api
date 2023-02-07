import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Like", likeSchema);
