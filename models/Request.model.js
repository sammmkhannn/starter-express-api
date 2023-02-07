import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  sender: {
    name: {
      type: String,
    },
    profile: {
      type: String,
    },
    id: {
      type: mongoose.Types.ObjectId,
    },
  },
  receiver: {
    name: {
      type: String,
    },
    profile: {
      type: String,
    },
    id: {
      type: mongoose.Types.ObjectId,
    },
  },
  status: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Request", requestSchema);
