import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
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
  senderId: {
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
  groupId: {
    type: mongoose.Types.ObjectId,
    required:true,
  }
});

export default mongoose.model("Chat", chatSchema);
