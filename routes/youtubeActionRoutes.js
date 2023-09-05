import express from "express";
import {
  updateVideoThumbnail,
  uploadVideoToYoutube,
} from "../controllers/youtubeActionController.js";

const router = express.Router();

router.post("/uploadvideotoyoutube", uploadVideoToYoutube);

router.post(
  "/updatevideothumbnail/:workspaceId/:videoId",
  updateVideoThumbnail
);

export default router;
