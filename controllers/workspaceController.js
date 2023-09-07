import asyncHandler from "express-async-handler";
import { Workspace } from "../models/Workspace.js";

//Theek karna hai ise
export const accessWorkspace = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  let isWorkspace = await Workspace.find({
    $and: [{ users: { $elemMatch: { $eq: req.user._id } } }],
  }).populate("users", "-password");

  //kuch karna hai idhar
});

export const fetchAllWorkspaces = asyncHandler(async (req, res) => {
  try {
    Workspace.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("workspaceAdmin", "-password")
      .sort({ updated: -1 })
      .then(async (results) => {
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const createWorkspace = asyncHandler(async (req, res) => {
  if (!req.body.workspaceName || !req.body.users) {
    return res.status(400).send({
      message: "Please fill all the required fields",
    });
  }

  let users = JSON.parse(req.body.users);

  users.push(req.user);

  try {
    //Create group chat
    const workspace = await Workspace.create({
      workspaceName: req.body.workspaceName,
      users: users,
      workspaceAdmin: req.user,
    });

    //Now we fetch this chat and send it to the user
    const fullWorkspace = await Workspace.findOne({ _id: workspace._id })
      .populate("users", "-password")
      .populate("workspaceAdmin", "-password");

    return res.status(200).json(fullWorkspace);
  } catch (error) {
    throw new Error(error.message);
  }
});

export const renameWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, workspaceName } = req.body;

  const updatedWorkspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    {
      workspaceName: workspaceName,
    },
    {
      new: true, // it will return updated value
    }
  )
    .populate("users", "-password")
    .populate("workspaceAdmin", "-password");

  //Check if any errors
  if (!updatedWorkspace) {
    res.status(404);
    throw new Error("Workspace not found");
  } else {
    res.status(200).json(updatedWorkspace);
  }
});

export const addToWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, userToBeAddedId } = req.body;

  const added = await Workspace.findByIdAndUpdate(
    workspaceId,
    {
      $push: { users: userToBeAddedId }, //Add a new user
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("workspaceAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Workspace not found");
  } else {
    res.status(200).json(added);
  }
});

//Theek karna hai
export const removeFromWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, userToBeRemovedId } = req.body;

  const removed = await Workspace.findByIdAndUpdate(
    workspaceId,
    {
      $pull: { users: userToBeRemovedId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("workspaceAdmin", "-password");

  if (!removed) {
    return res.status(404);
  } else {
    return res.status(200).json(removed);
  }
});

// Upload Video by anyone(workspace users) //Deprecated
export const uploadVideoToYUM = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  const video = req.body;

  try {
    workspace.videos.push(video);
    await workspace.save();
    // console.log(video);
    return res.status(200).json({
      video,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//Upload Video to YUM
export const uploadVideoToPlatform = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  const videoInfo = req.body;

  const video = videoInfo;
  try {
    workspace.videos.push(video);
    await workspace.save();
    // console.log(video);
    return res.status(200).json({
      video,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//Fetch all  videos from a workspace
export const allvideos = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  return res.status(200).json({
    videos: workspace.videos,
  });
});

//Get Video Info to prefill videoInfo on frontend
export const getVideoInfo = asyncHandler(async (req, res) => {
  const { workspaceId, videoId } = req.params;

  const workspace = await Workspace.findById(workspaceId);
  let videoFound = null;
  videoFound = workspace.videos.filter(
    (curVideo) => curVideo._id.toString() === videoId.toString()
  );

  if (videoFound === null || videoFound.length === 0) {
    // console.log("Video not found");
    return res.status(404).json({
      success: false,
      message: "Sorry, video not found!",
    });
  }

  try {
    // console.log(videoFound[0]);
    return res.status(200).json({
      success: true,
      videoInfo: videoFound[0],
    });
  } catch (error) {
    // console.log(error);
    return res.status(400).json({
      success: true,
      message: "Some error occurred ",
    });
  }
});

//Edit Video Info
export const editVideoInfo = asyncHandler(async (req, res) => {
  const { workspaceId, videoId } = req.params;
  const { title, description, category, tags } = req.body;

  const workspace = await Workspace.findById(workspaceId);
  let videoFound = null;
  videoFound = workspace.videos.filter(
    (curVideo) => curVideo._id.toString() === videoId.toString()
  );

  if (videoFound === null || videoFound.length === 0) {
    // console.log("Video not found");
    return res.status(404).json({
      success: false,
      message: "Sorry, video not found!",
    });
  }

  const tempTagsArray = tags.split(",");
  const updatedTagsArray = [...tempTagsArray];
  const uniqueUpdatedTagsArray = [...new Set(updatedTagsArray)];

  try {
    videoFound[0].title = title;
    videoFound[0].description = description;
    videoFound[0].category = category;
    videoFound[0].tags = uniqueUpdatedTagsArray;
    await workspace.save();
    return res.status(200).json({
      success: true,
      message: "Changes updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: true,
      message: "Some error occurred ",
    });
  }
});

//Update Thumbnail
export const updateThumbnail = asyncHandler(async (req, res) => {
  const { workspaceId, videoId } = req.params;
  const thumbnailInfo = req.body;

  const workspace = await Workspace.findById(workspaceId);
  let videoFound = null;
  videoFound = workspace.videos.filter(
    (curVideo) => curVideo._id.toString() === videoId.toString()
  );

  if (videoFound === null || videoFound.length === 0) {
    console.log("Video not found");
    return res.status(404).json({
      success: false,
      message: "Sorry, video not found!",
    });
  }

  try {
    videoFound[0].thumbnail = {
      public_id: thumbnailInfo.public_id,
      url: thumbnailInfo.url,
    };
    await workspace.save();
    return res.status(200).json({
      success: true,
      message: "Thumbnail updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: true,
      message: "Some error occurred ",
    });
  }
});
