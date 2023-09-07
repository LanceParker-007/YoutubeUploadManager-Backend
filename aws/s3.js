import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import asyncHandler from "express-async-handler";

const bucketName = "bucket-yum-videos";

//AWS pre-signed url to upload files
export const generateUploadURL = asyncHandler(async (filename, contentType) => {
  const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_IAM_USER_ACCESS_KEY,
      secretAccessKey: process.env.AWS_IAM_USER_SECRET_ACCESS_KEY,
    },
  });
  try {
    // console.log("here 1");
    // console.log(filename);
    const command = new PutObjectCommand({
      Bucket: "bucket-yum-videos",
      Key: `uploads/user-yum-videos/${filename}`,
      ContentType: contentType,
    });

    const uploadURL = await getSignedUrl(s3Client, command);
    return uploadURL;
  } catch (error) {
    console.log(error);
  }
});

export const getUploadURL = async (req, res) => {
  const { videoName, videoType } = req.body;

  const filename = `${videoName}-${Date.now()}.mp4`;
  const uploadURL = await generateUploadURL(filename, videoType);
  // console.log(uploadURL);
  return res.json({ success: true, public_id: filename, signedURL: uploadURL });
};
