import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    usersLimit: {
      type: Number,
      required: true,
    },
    groupImage: {
      type: String,
    },
  },
  {
    timeStamps: true,
  }
);

export default mongoose.model("PublicGroup", groupSchema);
