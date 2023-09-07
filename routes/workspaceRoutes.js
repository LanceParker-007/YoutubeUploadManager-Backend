import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  accessWorkspace,
  fetchAllWorkspaces,
  createWorkspace,
  renameWorkspace,
  addToWorkspace,
  removeFromWorkspace,
  uploadVideoToYUM,
  allvideos,
  editVideoInfo,
  getVideoInfo,
  updateThumbnail,
  uploadVideoToPlatform,
} from "../controllers/workspaceController.js";
import singleUpload from "../middleware/multer.js";
import { getUploadURL } from "../config/s3.js";

const router = express.Router();

//createChat or fecthcing a one-to-one chat
router.route("/accessworkspace").post(protect, accessWorkspace);

//Get all Workspaces
router.route("/fetchallworkspaces").get(protect, fetchAllWorkspaces);

//Create a group chat
router.route("/createworkspace").post(protect, createWorkspace);

//Rename a Workspace
router.route("/renameworkspace").put(protect, renameWorkspace);

//Add User to Workspace
router.route("/addusertoworkspace").put(protect, addToWorkspace);

//Remove User from Workspace
router.route("/removeuserfromworkspace").put(protect, removeFromWorkspace);

//Upload Video Details to YUM
router.route("/upload/:id").post(protect, singleUpload, uploadVideoToYUM);

//Fetch all videos of workspace
router.route("/allvideos/:id").get(protect, allvideos);

//Fetch video info
router.route("/:workspaceId/:videoId").get(protect, getVideoInfo);

//Update Video Info in DB, nake this route more meaningful
router.route("/:workspaceId/:videoId").put(protect, editVideoInfo);

//Update Thumbnail in DB
router
  .route("/updatethumbnail/:workspaceId/:videoId")
  .put(protect, updateThumbnail);

//-----AWS------------
// router.get("/s3url/videoname", generateUploadURL);

// Upload Video to AWS and store video info YUM
router.route("/uploadvideo/:id").post(uploadVideoToPlatform);

router.post("/trial", getUploadURL);

export default router;
