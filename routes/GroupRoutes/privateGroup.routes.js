import {
  createGroup,
  updateGroup,
  deleteGroup,
  makeAdmin,
  getAllUsers,
  updateGroupUsers,
} from "../../controllers/GroupContrllers/privateGroup.controllers.js";
import { upload } from "../../controllers/UserControllers/user.controllers.js";
import express from "express";
import verifyAuth from "../../middlewares/verifyAuth.js";
const router = express.Router();

router.post("/create",verifyAuth, upload.single("groupImage"), createGroup);
router.put("/update",verifyAuth, upload.single("groupImage"), updateGroup);
router.post("/delete",verifyAuth, deleteGroup);
// router.put("/make-admin",verifyAuth, makeAdmin);
router.post("/get-users",verifyAuth, getAllUsers);
router.put("/update-users",verifyAuth, updateGroupUsers);
export default router;
