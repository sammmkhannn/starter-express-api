import mongoose from "mongoose";

const filterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
  },
  minAge: {
    type: Number,
  },
  maxAge: {
    type: Number,
  },
  gender: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
});

export default mongoose.model("Filter", filterSchema);
