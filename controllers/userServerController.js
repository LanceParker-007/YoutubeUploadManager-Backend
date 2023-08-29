import asyncHandler from "express-async-handler";
import subscriptions from "../tempData/subscriptions.js";

export const createServerSubscription = () => {};

export const checkServerSubscription = asyncHandler(async (req, res) => {
  const { inputServer: userServer } = req.body;

  console.log("userServer", userServer);
  try {
    const subscription = subscriptions.find(
      (subscription) =>
        subscription.serverip.toString() === userServer.toString()
    );

    if (subscription && subscription.status === "active") {
      return res.status(200).json({
        success: true,
        message: "Connecting to server ",
        subscription,
      });
    } else if (subscription && subscription.status === "inactive") {
      return res.status(400).json({
        success: false,
        message: "Subscription expired",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: `Server not found`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error connecting to your server",
    });
  }
});
