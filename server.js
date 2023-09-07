import { S3Client } from "@aws-sdk/client-s3";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import cloudinary from "cloudinary";

export const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_IAM_USER_ACCESS_KEY,
    secretAccessKey: process.env.AWS_IAM_USER_SECRET_ACCESS_KEY,
  },
});

try {
  connectDB();

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
