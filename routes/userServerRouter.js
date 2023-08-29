import express from "express";
import {
  checkServerSubscription,
  createServerSubscription,
} from "../controllers/userServerController.js";

const router = express.Router();

router.post("/subscriptions", createServerSubscription);
router.post("/checksubscription", checkServerSubscription);

export default router;
