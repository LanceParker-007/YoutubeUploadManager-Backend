import axios from "axios";
import express from "express";
import jwt from "jsonwebtoken";
import { google } from "googleapis";

const router = express.Router();

// ----------------------------------------------------------------
let oauth2Client;
// ----------------------------------------------------------------

let ytAccessToken = null;
let ytAccessTokenCreatedTime = null;

// Define your Google OAuth callback route
router.get("/google/callback", async (req, res) => {
  oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.PROD_REDIRECT_URI // Change According to user
  );
  const authorizationCode = req.query.code;

  // Make sure the token endpoint URL is correct
  const tokenEndpoint = "https://oauth2.googleapis.com/token";

  const tokenData = {
    code: authorizationCode,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.PROD_REDIRECT_URI, //userserverRedirectURI
    grant_type: "authorization_code",
  };

  try {
    // Make the token exchange request
    const response = await axios.post(tokenEndpoint, null, {
      params: tokenData,
    });

    const access_token = response.data.access_token;
    const googleUser = jwt.decode(response.data.id_token);

    if (!googleUser.email_verified) {
      res.status(400).json({
        success: false,
        message: "Google has not verified your account",
      });
    }

    ytAccessToken = access_token;
    ytAccessTokenCreatedTime = new Date().getTime();

    return res.redirect(process.env.PROD_FRONTEND_URL);
  } catch (error) {
    console.error("Error exchanging authorization code:", error);
    // Handle errors and send an appropriate response to the frontend
    return res
      .status(500)
      .send("Failed to authenticate user. Error exchanging authorization code");
  }
});

router.get("/getytaccesstoken", (req, res) => {
  const currentTime = new Date().getTime();
  const elapsedTimeInSeconds = (currentTime - ytAccessTokenCreatedTime) / 1000;

  if (elapsedTimeInSeconds > 3600) {
    return res.status(200).json({
      ytAccessToken: null,
      currentTime,
    });
  }

  return res.status(200).json({
    ytAccessToken: ytAccessToken,
    currentTime,
  });
});

export default router;
export { oauth2Client };
