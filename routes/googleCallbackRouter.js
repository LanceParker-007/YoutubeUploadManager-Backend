import axios from "axios";
import express from "express";
import { google } from "googleapis";
const router = express.Router();

// ----------------------------------------------------------------
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.PROD_REDIRECT_URI
);
// ----------------------------------------------------------------

// Define your Google OAuth callback route
router.get("/google/callback", async (req, res) => {
  const authorizationCode = req.query.code;

  // Make sure the token endpoint URL is correct
  const tokenEndpoint = "https://oauth2.googleapis.com/token";

  const tokenData = {
    code: authorizationCode,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.PROD_REDIRECT_URI,
    grant_type: "authorization_code",
  };

  try {
    // Make the token exchange request
    const response = await axios.post(tokenEndpoint, null, {
      params: tokenData,
    });

    // Extract the access token from the response and set to outh2Client credentials
    const ACCESS_TOKEN = response.data.access_token;
    oauth2Client.setCredentials({
      access_token: ACCESS_TOKEN,
    });

    // res.redirect(process.env.DEV_FRONTEND_URL);
    res.redirect(process.env.PROD_FRONTEND_URL);
  } catch (error) {
    console.error("Error exchanging authorization code:", error);
    // Handle errors and send an appropriate response to the frontend
    res.status(500).send("Error exchanging authorization code");
  }
});

export default router;
export { oauth2Client };
