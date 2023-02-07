import {
  createPost,
  getPosts,
  getMyandMyFriendsPosts,
  getComments,
  getReplies,
  deletePost,
  updatePost,
  likeUnlikePost,
  comment,
  reply,
  getLikes,
  hideUnhidePost,
  superLike,
  getCommentsCount,
  superLikesCount,
  getTotalLikes,
} from "../../controllers/UserPostControllers/post.controllers.js";
import { Router } from "express";
import { upload } from "../../controllers/UserControllers/user.controllers.js";
import verifyAuth from "../../middlewares/verifyAuth.js";
import { verify } from "crypto";

const router = Router();

router.post("/create",verifyAuth, upload.any(), createPost);
router.get("/user-posts",verifyAuth, getPosts);
router.get("/all-posts",verifyAuth, getMyandMyFriendsPosts);
router.post("/comments",verifyAuth, getComments);
router.post("/replies",verifyAuth, getReplies);
router.delete("/remove",verifyAuth, deletePost);
router.put("/update",verifyAuth,upload.any(), updatePost);
router.put("/like-unlike",verifyAuth, likeUnlikePost);
router.post("/comment",verifyAuth, comment);
router.post("/comments/reply",verifyAuth, reply);
router.get("/likes",verifyAuth, getLikes);
router.put("/hide-unhide",verifyAuth, hideUnhidePost);
router.put("/super-like",verifyAuth, superLike);
router.get("/comments-count",verify, getCommentsCount);
router.get("/superlikes-count",verify, superLikesCount);
router.get("/likes/total",verify, getTotalLikes);

export default router;
