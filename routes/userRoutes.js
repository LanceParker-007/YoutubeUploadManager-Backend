import express from "express";
import {
  login,
  registerUser,
  searchUser,
  signinWithGoogle,
  signupWithGoogle,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/searchusers", protect, searchUser);
router.post("/signupwithgoogle", signupWithGoogle);
router.post("/signinwithgoogle", signinWithGoogle);

export default router;
