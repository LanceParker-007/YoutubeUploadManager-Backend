import express from "express";
import { uploadVideoToYoutube } from "../controllers/youtubeActionController.js";

const router = express.Router();

router.post("/uploadvideotoyoutube", uploadVideoToYoutube);

export default router;
