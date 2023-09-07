import express from "express";
import {
  pushChangesToYoutube,
  updateVideoThumbnail,
  uploadVideoToYoutube,
} from "../controllers/youtubeActionController.js";

const router = express.Router();

router.post("/uploadvideotoyoutube", uploadVideoToYoutube);

router.post(
  "/updatevideothumbnail/:workspaceId/:videoId",
  updateVideoThumbnail
);

router.post(
  "/pushchangestoyoutube/:workspaceId/:videoId",
  pushChangesToYoutube
);

export default router;
