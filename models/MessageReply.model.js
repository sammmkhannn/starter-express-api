import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  messageText: {
    type: String,
  },
  video: {
    title: {
      type: String,
    },
    path: {
      type: String,
    },
  },
  audio: {
    title: {
      type: String,
    },
    path: {
      type: String,
    },
  },
  image: {
    title: {
      type: String,
    },
    path: {
      type: String,
    },
  },
  senderId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  receiverId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  messageId: {
    type: mongoose.Types.ObjectId,
    ref: "Message",
    required: true,
  },
});

export default mongoose.model("Reply", replySchema);
