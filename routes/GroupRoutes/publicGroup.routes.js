import {
  createGroup,
  updateGroup,
  deleteGroup,
} from "../../controllers/GroupContrllers/publicGroup.controllers.js";
import { upload } from "../../controllers/UserControllers/user.controllers.js";
import express from "express";
import verifyAuth from "../../middlewares/verifyAuth.js";
const router = express.Router();

router.post("/create",verifyAuth, upload.single("groupImage"), createGroup);
router.put("/update",verifyAuth, updateGroup);
router.delete("/delete/:groupId",verifyAuth, deleteGroup);

export default router;
