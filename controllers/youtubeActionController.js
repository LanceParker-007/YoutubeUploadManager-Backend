import asyncHandler from "express-async-handler";
import { Workspace } from "../models/Workspace.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { google } from "googleapis";
import { oauth2Client } from "../routes/googleCallbackRouter.js";
import axios from "axios";
import { Readable } from "stream";

//Upload video to youtube //Shift to new Controller(Youtube Function Controller)
export const uploadVideoToYoutube = asyncHandler(async (req, res) => {
  //Find if video exists
  const { selectedWorkspaceId, videoId, accessToken } = req.body;

  const workspace = await Workspace.findById(selectedWorkspaceId);
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

  // console.log("here 1");
  // console.log(videoFound[0].video.url);
  // console.log("here 2");
  const cloudinaryVideoUrl = videoFound[0].video.url.toString();

  const youtube = google.youtube("v3");

  const response = await axios.get(cloudinaryVideoUrl, {
    responseType: "arraybuffer", // Important to get binary data
  });

  // Convert the downloaded data to a readable stream
  const videoBuffer = Buffer.from(response.data);
  const videoStream = new Readable();
  videoStream.push(videoBuffer);
  videoStream.push(null);

  //Working Youtube Code, isko udhar ytApi mein set karna hai
  if (accessToken) {
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
  } else {
    res.status(400);
    throw new Error("Yt Access Token Expired. Login again");
  }

  try {
    youtube.videos.insert({
      auth: oauth2Client,
      part: "snippet,contentDetails,status",
      resource: {
        // Set the video title and description
        snippet: {
          title: videoFound[0].title,
          description: videoFound[0].description,
        },
        // Set the video privacy status
        status: {
          privacyStatus: "private",
        },
      },
      // Create the readable stream to upload the video
      media: {
        body: videoStream,
      },
    });

    videoFound[0].status = true;
    await workspace.save();
    res.status(200).json({
      success: true,
      message: `Video uploaded to Youtube!`,
    });
  } catch (error) {
    console.log("ERRORRR: ", error);
    res.status(500).json({
      message: `Error occurred while uploading video to Youtube!`,
    });
  }
});
