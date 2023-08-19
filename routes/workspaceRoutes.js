import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  accessWorkspace,
  fetchAllWorkspaces,
  createWorkspace,
  renameWorkspace,
  addToWorkspace,
  removeFromWorkspace,
} from "../controllers/workspaceController.js";

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

//Search Workspaces API

//Upload Video Details API

//Upload Video to youtube API
export default router;
