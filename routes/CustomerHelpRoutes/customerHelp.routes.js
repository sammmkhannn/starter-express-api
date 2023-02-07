import {
  createRequest,
  getAllCustomerRequests,
} from "../../controllers/CustomerHelpControllers/customerHelp.controllers.js";
import express from "express";
import verifyAuth from "../../middlewares/verifyAuth.js";
const router = express.Router();

router.post("/create",verifyAuth, createRequest);
router.get("/get",verifyAuth, getAllCustomerRequests);

export default router;
