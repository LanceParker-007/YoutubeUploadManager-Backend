import asyncHandler from "express-async-handler";
import { Workspace } from "../models/Workspace.js";
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
    // console.log("Video not found");
    return res.status(404).json({
      success: false,
      message: "Sorry, video not found!",
    });
  }

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

  videoFound[0].tags = videoFound[0].tags.split(" ");
  try {
    const { data } = await youtube.videos.insert({
      auth: oauth2Client,
      part: "snippet,contentDetails,status",
      resource: {
        // Set the video title and description
        snippet: {
          title: videoFound[0].title,
          description: videoFound[0].description
            ? videoFound[0].description
            : "",
          tags: videoFound[0].tags ? videoFound[0].tags : [],
          categoryId: 22,
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

    videoFound[0].youtubeId = data.id;
    videoFound[0].status = true;
    await workspace.save();
    res.status(200).json({
      success: true,
      message: `Video uploaded to Youtube!`,
    });
  } catch (error) {
    // console.log("ERRORRR: ", error);
    res.status(500).json({
      message: `Error occurred while uploading video to Youtube!`,
    });
  }
});

//Upload thumbnail to Youtube
export const updateVideoThumbnail = asyncHandler(async (req, res) => {
  //Find if video exists
  const { workspaceId, videoId } = req.params;
  const { youtubeId, accessToken } = req.body;

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

  //Working Youtube Code, isko udhar ytApi mein set karna hai
  if (accessToken) {
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
  } else {
    res.status(400);
    throw new Error("Yt Access Token Expired. Login again");
  }

  // console.log(youtubeId);
  // console.log(accessToken);

  //------------------------------------------------
  const cloudinaryImageUrl = videoFound[0].thumbnail?.url.toString();
  // console.log(cloudinaryImageUrl);
  const responseCloudinary = await axios.get(cloudinaryImageUrl, {
    responseType: "arraybuffer", // Important to get binary data
  });

  // Convert the downloaded data to a readable stream
  const imageBuffer = Buffer.from(responseCloudinary.data);
  const imageStream = new Readable();
  imageStream.push(imageBuffer);
  imageStream.push(null);

  //-----------------------------------------------

  try {
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const response = await youtube.thumbnails.set({
      videoId: youtubeId,
      media: {
        body: imageStream,
      },
    });

    // console.log(response);

    // console.log("Thumbnail uploaded successfully!");

    res.status(200).json({
      success: true,
      message: `Thumbnail updated`,
    });
  } catch (error) {
    console.log("ERRORRR: ", error);
    res.status(500).json({
      message: `Error occurred while updating thumbnail`,
    });
  }
});

//Push Chnages to youtube
export const pushChangesToYoutube = asyncHandler(async (req, res) => {
  //Find if video exists
  const { workspaceId, videoId } = req.params;
  const { youtubeId, accessToken } = req.body;

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

  //Working Youtube Code, isko udhar ytApi mein set karna hai
  if (accessToken) {
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
  } else {
    res.status(400);
    throw new Error("Yt Access Token Expired. Login again");
  }

  // console.log(youtubeId);
  // console.log(accessToken);

  try {
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    videoFound[0].tags = videoFound[0].tags.split(" ");
    const response = await youtube.videos.update({
      auth: oauth2Client,
      part: "snippet",
      videoId: youtubeId,
      resource: {
        id: youtubeId,
        snippet: {
          title: videoFound[0].title,
          description: videoFound[0].description
            ? videoFound[0].description
            : "",
          tags: videoFound[0].tags ? videoFound[0].tags : [],
          categoryId: 22,
        },
      },
    });

    // console.log(response);

    // console.log("Changes updated to Youtube successfully");

    res.status(200).json({
      success: true,
      message: `Changes updated to Youtube successfully`,
    });
  } catch (error) {
    console.log("ERRORRR: ", error);
    res.status(500).json({
      message: `Error occurred while updating changes`,
    });
  }
});
