import app from "./app.js";
import { connectDB } from "./config/db.js";
import cloudinary from "cloudinary";

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
