import {
  register,
  login,
  upload,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updateProfile,
  completeProfile,
  getAllProfilePictures,
  uploadProfilePicture,
  setProfilePicture,
  delImage,
  filterUsers,
  sendFriendRequest,
  acceptFriendRequest,
  denyFriendRequest,
  getFriendRequests,
  updateStatus,
  updateShowStatus,
  updateShowLastSeen,
  updateShowWealth,
  updateHideFriendList,
  updateHidePosts,
  updateSendFriedRequests,
  getFriendList,
  getUserProfile,
  getOtherUserProfile,
  updateFilter,
  unFriend,
  withdrawRequest,
  getFilter,
  blockUnblockUser,
  getAllGroups,
  getUserPrivateGroups,
  getUserChatLogs
} from "../../controllers/UserControllers/user.controllers.js";
import verifyAuth from "../../middlewares/verifyAuth.js";
import express from "express";
import verifyEmail from "../../middlewares/verifyEmail.js";

const router = express.Router();
router.get("/", (req, res) => {
  return res.status(200).send("hellow");
});
router.post("/register", verifyEmail, register);
router.post("/login", login);
router.post("/request-otp",forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset",verifyAuth, resetPassword);
router.put("/update-profile",verifyAuth, updateProfile);
router.post("/complete-profile",verifyAuth, upload.any(), completeProfile);
router.get("/pictures",verifyAuth, getAllProfilePictures);
router.post("/upload", verifyAuth, upload.single("profile"), uploadProfilePicture);
router.post("/set-profile-picture",verifyAuth, setProfilePicture);
router.delete("/pictures/delete",verifyAuth, delImage);
router.get("/search",verifyAuth, filterUsers);
router.post("/friend-request",verifyAuth, sendFriendRequest);
router.get("/friend-request/accept",verifyAuth, acceptFriendRequest);
router.delete("/friend-request/cancel",verifyAuth, denyFriendRequest);
router.delete(
  "/withdraw-friend-request",verifyAuth,
  withdrawRequest
);
router.get("/friends",verifyAuth, getFriendList);
router.get("/friend-requests",verifyAuth, getFriendRequests);
router.put("/unfriend",verifyAuth, unFriend);
router.put("/status/update",verifyAuth, updateStatus);
router.put("/settings/status",verifyAuth, updateShowStatus);
router.put("/settings/last-seen",verifyAuth, updateShowLastSeen);
router.put("/settings/wealth/update-show",verifyAuth, updateShowWealth);
router.put("/settings/friend-list",verifyAuth, updateHideFriendList);
router.put("/settings/posts",verifyAuth, updateHidePosts);
router.put("/settings/send-request",verifyAuth, updateSendFriedRequests);
router.get("/other-user-profile",verifyAuth, getOtherUserProfile);
router.get("/profile",verifyAuth, getUserProfile);
router.put("/filter/update",verifyAuth, updateFilter);
router.get("/filter",verifyAuth, getFilter);
router.post("/block-unblock",verifyAuth, blockUnblockUser);
router.get("/groups",verifyAuth, getAllGroups);
router.get('/groups/private-groups',verifyAuth, getUserPrivateGroups);
router.get('/messages/all',verifyAuth, getUserChatLogs);
export default router;