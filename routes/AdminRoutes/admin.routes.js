import { blockUnblockUser, removeUser, updateUser } from "../../controllers/AdminControllers/admin.controllers.js";
import express from "express";
import verifyAuth from "../../middlewares/verifyAuth.js";
const router = express.Router();

router.put("/block-unblock-user",verifyAuth, blockUnblockUser);
router.delete("/remove-user",verifyAuth, removeUser);
router.put("/update-user",verifyAuth, updateUser);

export default router;