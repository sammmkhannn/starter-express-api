import mongoose from "mongoose";

const superLikeSchema = new mongoose.Schema(
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
    liked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SuperLike", superLikeSchema);
