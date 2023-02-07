import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  date: {
    type:Date,
    default: Date.now(),
  },
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  page: {
    type: Number,
    default: 1,
  },
});

export default mongoose.model("Notification", notificationSchema);
