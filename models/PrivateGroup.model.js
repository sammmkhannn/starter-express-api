import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    users: {
      type: Array,
      required: true,
    },
    groupImage: {
      type: String,
    },
    admins: {
      type: Array,
    },
  },
  {
    timeStamps: true,
  }
);

export default mongoose.model("privateGroup", groupSchema);
