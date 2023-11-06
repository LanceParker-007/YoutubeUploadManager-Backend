import asyncHandler from "express-async-handler";
import { Workspace } from "../models/Workspace.js";
import { google } from "googleapis";
import { oauth2Client } from "../server.js";
import axios from "axios";
import { Readable } from "stream";

//Old Version: Upload video to youtube //Shift to new Controller(Youtube Function Controller)
// export const uploadVideoToYoutube = asyncHandler(async (req, res) => {
//   //Find if video exists
// const { selectedWorkspaceId, videoId, accessToken } = req.body;

// const workspace = await Workspace.findById(selectedWorkspaceId);
// let videoFound = null;
// videoFound = workspace.videos.filter(
//   (curVideo) => curVideo._id.toString() === videoId.toString()
// );

// if (videoFound === null || videoFound.length === 0) {
//   // console.log("Video not found");
//   return res.status(404).json({
//     success: false,
//     message: "Sorry, video not found!",
//   });
// }

// const s3VideoUrl = videoFound[0].video.url.toString();

//   const youtube = google.youtube("v3");

//   const response = await axios.get(s3VideoUrl, {
//     responseType: "arraybuffer", // Important to get binary data
//   });

//   // Convert the downloaded data to a readable stream
//   const videoBuffer = Buffer.from(response.data);
//   const videoStream = new Readable();
//   videoStream.push(videoBuffer);
//   videoStream.push(null);

//   //Working Youtube Code, isko udhar ytApi mein set karna hai
//   if (accessToken) {
//     oauth2Client.setCredentials({
//       access_token: accessToken,
//     });
//   } else {
//     res.status(400);
//     throw new Error("Yt Access Token Expired. Login again");
//   }

//   try {
//     const { data } = await youtube.videos.insert({
//       auth: oauth2Client,
//       part: "snippet,contentDetails,status",
//       resource: {
//         // Set the video title and description
//         snippet: {
//           title: videoFound[0].title,
//           description: videoFound[0].description
//             ? videoFound[0].description
//             : "",
//           tags: videoFound[0].tags ? videoFound[0].tags : [],
//           categoryId: videoFound[0].category,
//         },
//         // Set the video privacy status
//         status: {
//           privacyStatus: "private",
//         },
//       },
//       // Create the readable stream to upload the video
//       media: {
//         body: videoStream,
//       },
//     });

//     // videoFound[0].youtubeId = data.id;
//     // videoFound[0].status = true;
//     // await workspace.save();

//     res.status(200).json({
//       success: true,
//       message: `Video uploaded to Youtube!`,
//     });
//   } catch (error) {
//     console.log("ERRORRR: ", error);
//     res.status(500).json({
//       message: `Error occurred while uploading video to Youtube!`,
//     });
//   }
// });

// New version: Upload video in Chunks

const CHUNK_SIZE = 40 * 1024 * 1024; // 512KB, 524288
// New Version: Upload video in Chunks
const uploadVideoInChunks = asyncHandler(
  async (sessionUrl, videoBuffer, totalSize, accessToken) => {
    let start = 0;
    let end = 0;
    let success = false;

    while (!success && start < totalSize) {
      end = Math.min(start + CHUNK_SIZE, totalSize) - 1;
      let chunk = videoBuffer.slice(start, end + 1);

      const chunkVideoStream = new Readable();
      chunkVideoStream.push(chunk);
      chunkVideoStream.push(null);

      let headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Length": chunk.length,
        "Content-Type": "video/*",
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
      };

      try {
        const response = await axios.put(sessionUrl, chunkVideoStream, {
          headers: headers,
        });

        if (response.status === 200 || response.status === 201) {
          // console.log("Upload complete", response);
          return response;
        }
      } catch (error) {
        if (error.response) {
          // Handle 308 Resume Incomplete
          if (error.response.status === 308) {
            const rangeHeader = error.response.headers["range"];
            if (rangeHeader) {
              // Successfully uploaded byte range returned by server - "0-524287" for example
              const ranges = rangeHeader.split("-");
              const lastByte = parseInt(ranges[1], 10);
              start = lastByte + 1;
            } else {
              // If there's no range header, retry the same chunk
              console.log("Retrying chunk as no range header is present.");
            }
          } else {
            console.error(
              `Failed to upload chunk: ${start}-${end}. Error: ${error}`
            );
            // Implement your retry logic or error handling here
            throw error;
          }
        } else {
          console.error(`Unknown error occurred: ${error}`);
          throw error;
        }
      }
    }
  }
);
// -----

export const uploadVideoToYoutube = asyncHandler(async (req, res) => {
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

  const s3VideoUrl = videoFound[0].video.url.toString();

  // Fetch video from S3 using its URL.
  const response = await axios.get(s3VideoUrl, {
    responseType: "arraybuffer", // Important to get binary data
  });

  // Convert the downloaded data to a readable stream
  const videoBuffer = Buffer.from(response.data);
  // console.log("video fetch successful");

  //Working Youtube Code, isko udhar ytApi mein set karna hai
  if (accessToken) {
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
  } else {
    res.status(400);
    throw new Error("Yt Access Token Expired. Login again");
  }

  //Preparation for getting upload session url
  const url = "https://www.googleapis.com/upload/youtube/v3/videos";
  const params = {
    uploadType: "resumable",
    part: "snippet,status",
  };
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json; charset=UTF-8",
  };
  const data = {
    snippet: {
      categoryId: "22",
      description: "Description of uploaded video.",
      title: "Test video upload try 2.",
    },
    status: {
      privacyStatus: "private",
    },
  };

  // console.log("Preparation done to get upload session url");
  const getSessionUrlResponse = await axios.post(url, data, {
    headers,
    params,
  });
  const uploadSessionUrl = getSessionUrlResponse.headers.location;
  // console.log("uploadSessionUrl: ", uploadSessionUrl);

  try {
    console.log("Uploading chunks...");
    // Upload the video to YouTube in chunks.
    const mainResponse = await uploadVideoInChunks(
      uploadSessionUrl,
      videoBuffer,
      videoBuffer.length,
      accessToken
    );
    // console.log("Main Response", mainResponse);

    videoFound[0].youtubeId = mainResponse.data.id;
    videoFound[0].status = true;
    await workspace.save();

    res.status(200).json({
      success: true,
      message: `Video uploaded to Youtube!`,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: `Video uploading failed`,
      error,
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
          categoryId: videoFound[0].category,
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
