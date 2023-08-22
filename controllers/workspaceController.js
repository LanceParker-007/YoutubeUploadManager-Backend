import asyncHandler from "express-async-handler";
import { Workspace } from "../models/Workspace.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { google } from "googleapis";
import fs from "fs";
import { oauth2Client } from "../routes/googleCallbackRouter.js";
import { response } from "express";

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

// Upload Video by anyone(workspace users)
export const uploadVideoToYUM = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  const { title, description } = req.body;

  const file = req.file;
  const fileUri = getDataUri(file);

  //Cloudinary
  const cloudinaryUploadOptions = {
    folder: "ProjectS",
    resource_type: "video",
  };

  const mycloud = await cloudinary.v2.uploader.upload(
    fileUri.content,
    cloudinaryUploadOptions
  );

  //Database
  const video = {
    title,
    description,
    video: { public_id: mycloud.public_id, url: mycloud.secure_url },
    status: false,
  };
  workspace.videos.push(video);

  await workspace.save();

  return res.status(200).json({
    video,
  });
});

//Fetch all  videos from a workspace
export const allvideos = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  return res.status(200).json({
    videos: workspace.videos,
  });
});

//Upload video to youtube
export const uploadVideoToYoutube = asyncHandler(async (req, res) => {
  // const { selectedWorkspaceId, videoId } = req.body;
  // const workspace = await Workspace.findById(selectedWorkspaceId);
  // let video = null;
  // video = workspace.videos.filter(
  //   (curVideo) => curVideo._id.toString() === videoId.toString()
  // );

  // Create a YouTube service object
  const youtube = google.youtube("v3");
  //AWS ya kisi store se path dena padega
  // const videoPath =
  //   "https://res.cloudinary.com/dk2fcl7bi/video/upload/v1692614568/ProjectS/jsry3bcb37usn3hksrfk.mp4";

  // Create a request to upload the video
  // try {
  //   youtube.videos.insert({
  //     auth: oauth2Client,
  //     part: "snippet,contentDetails,status",
  //     resource: {
  //       // Set the video title and description
  //       snippet: {
  //         title: "Testomg Title",
  //         description: "Testing description",
  //       },
  //       // Set the video privacy status
  //       status: {
  //         privacyStatus: "private",
  //       },
  //     },
  //     // Create the readable stream to upload the video
  //     media: {
  //       body: fs.createReadStream("./assets/videos/demovideo1.mp4"),
  //     },
  //   });

  //   res.status(200).json({
  //     message: `Video uploaded to Youtube!`,
  //   });
  // } catch (error) {
  //   res.status(500).json({
  //     Error: `Some error occurred while uploading video `,
  //     errorMessage: error,
  //   });
  // }

  res.status(200).json({
    success: true,
    message: `Video uploaded successfully`,
  });
});
