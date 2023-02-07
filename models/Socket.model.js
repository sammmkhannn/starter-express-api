import mongoose from "mongoose";

const socketSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
});

export default mongoose.model("Socket", socketSchema);
