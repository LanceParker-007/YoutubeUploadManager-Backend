import axios from "axios";
import express from "express";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import generateToken from "../utils/generateToken.js";
import { User } from "../models/User.js";

const router = express.Router();
// ----------------------------------------------------------------
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.PROD_REDIRECT_URI
);
// ----------------------------------------------------------------

// ----------------------------------------------------------------
const accessTokenCookieOptions = {
  maxAge: 3600000, // 1hr
  domain: "localhost",
  path: "/",
  secure: false, //true hone se website pe cookie ayegi postman pe nahi
  sameSite: "lax",
  domain: "localhost",
};

const refreshTokenCookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 3.154e10, // 1 year
};
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

    // Getting user details
    // const id_token = response.data.id_token;
    const access_token = response.data.access_token;
    const googleUser = jwt.decode(response.data.id_token);
    // const googleUser = await getGoogleUser({ id_token, access_token });
    // console.log(googleUser.name);
    if (!googleUser.email_verified) {
      res.status(400).json({
        success: false,
        message: "Google has not verified your account",
      });
    }

    const accessToken = jwt.sign(
      {
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        access_token: access_token,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1hr",
      }
    );
    const refreshToken = jwt.sign(
      {
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "365d",
      }
    );

    // console.log(access_token);
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);

    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    //-------Create Session

    //Working Youtube Code
    oauth2Client.setCredentials({
      access_token: access_token,
    });
    res.redirect(process.env.PROD_FRONTEND_URL);
  } catch (error) {
    console.error("Error exchanging authorization code:", error);
    // Handle errors and send an appropriate response to the frontend
    res
      .status(500)
      .send("Failed to authenticate user. Error exchanging authorization code");
  }
});

router.get("/signin/google/callback", async (req, res) => {
  const authorizationCode = req.query.code;

  // Make sure the token endpoint URL is correct
  const tokenEndpoint = "https://oauth2.googleapis.com/token";

  const tokenData = {
    code: authorizationCode,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.PROD_SIGNIN_REDIRECT_URI,
    grant_type: "authorization_code",
  };

  try {
    // Make the token exchange request
    const response = await axios.post(tokenEndpoint, null, {
      params: tokenData,
    });

    const googleUser = jwt.decode(response.data.id_token);
    // console.log(googleUser.name);
    if (!googleUser.email_verified) {
      res.status(400).json({
        success: false,
        message: "Google has not verified your account",
      });
    }

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        pic: googleUser.picture,
      });

      if (user) user.save();
    }

    const userDetail = {
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    };

    res.cookie("userLoginDetail", userDetail, {
      maxAge: 86400000, // 1hr
      secure: true, //true hone se website pe cookie ayegi postman pe nahi
      sameSite: "lax",
    });
    //

    res.redirect(process.env.PROD_FRONTEND_URL);
  } catch (error) {
    console.error("Error Login in User", error);
    res.status(500).send("Failed to Login user");
  }
});

export default router;
export { oauth2Client };
