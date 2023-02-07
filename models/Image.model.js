import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    imageTitle: {
      type: String,
    },
    userId: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);
