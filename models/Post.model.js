import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    media: {
      type: Array,
      default:[]
    },
    dateTime: {
      type: Date,
      default: new Date(),
    },
    hide: {
      type: Boolean,
      default: false,
    },
    postType: {
      type:String,
    },
    likedByUser: {
      type: Boolean,
      default:false,
    },
    superLikedByUser: {
      type: Boolean,
      default:false,
    },
    latitude:{
      type:String
    },
    longitude:{
      type:String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
