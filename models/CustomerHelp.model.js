import mongoose from "mongoose";

const helpSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  timeStamp: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model("CustomerHelp", helpSchema);
