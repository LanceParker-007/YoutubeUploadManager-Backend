import express from "express";
import {
  login,
  registerUser,
  searchUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/searchusers", protect, searchUser);

export default router;
