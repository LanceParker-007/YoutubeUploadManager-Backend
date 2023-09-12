import { S3Client } from "@aws-sdk/client-s3";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import cloudinary from "cloudinary";
import { google } from "googleapis";

let oauth2Client = null;
let s3Client = null;

try {
  connectDB();

  oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.DEV_REDIRECT_URI // Change According to user
  );

  s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_IAM_USER_ACCESS_KEY,
      secretAccessKey: process.env.AWS_IAM_USER_SECRET_ACCESS_KEY,
    },
  });

  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API_KEY,
    api_secret: process.env.CLOUDINARY_CLIENT_API_SECRET,
  });

  app.listen(process.env.PORT, () => {
    console.log(`Server is up and running on port ${process.env.PORT}`);
  });
} catch (error) {
  console.log(error.message);
}

export { s3Client, oauth2Client };
