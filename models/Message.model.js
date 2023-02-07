import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  messageText: {
    type: String,
  },
  username: {
    type:String
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
  coin: {
    count: Number,
  },
  diamond: {
    count: Number,
  },
  key: {
    count: Number,
  },
  senderId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
  },
  dateTime: {
    type: Date,
    default: new Date(),
  },
  messageType: {
    type: String,
  }
});

export default mongoose.model("Message", messageSchema);
