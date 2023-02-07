import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 256,
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100,
  },
  gender: {
    type: String,
    required: true,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  country: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  state: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  city: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
    default: "offline",
  },
  friendList: {
    type: Array,
    default: [],
  },
  showOnline: {
    type: Boolean,
    default: true,
  },
  showLastSeen: {
    type: Boolean,
    default: true,
  },
  hideFriendList: {
    type: Boolean,
    default: false,
  },
  hidePosts: {
    type: Boolean,
    default: false,
  },
  allowFriendRequest: {
    type: Boolean,
    default: true,
  },
  hideWealthStore: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  resetToken: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  hobies: {
    type: Array,
  },
  aboutMe: {
    type: String,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
  profile: {
    type: String,
  },
  blockedUsers: {
    type: Array,
    default: [],
  },
  showAd: {
    type: Boolean,
    default: true,
  },
  showDate: {
    type: Boolean,
  },
  socketIds: {
    type: Array,
  },
  diamonds: {
    type:Number,
  },
  keys: {
    type:Number,
  },
  coins: {
    type:Number,
  },
  groups: {
    type:Array
  },
  
});

export default mongoose.model("User", userSchema);
