import asyncHandler from "express-async-handler";

//Model will be created till then temporary
const subscriptions = [
  {
    serverip: "127.0.0.1",
    subscriptionCreated: "2023",
    serverAdmin: "User 1",
    status: "active",
  },
  {
    serverip: "127.0.0.2",
    subscriptionCreated: "2022",
    serverAdmin: "User 2",
    status: "active",
  },
  {
    serverip: "127.0.0.3",
    subscriptionCreated: "2021",
    serverAdmin: "User 3",
    status: "inactive",
  },
  {
    serverip: "127.0.0.4",
    subscriptionCreated: "2024",
    serverAdmin: "User 4",
    status: "active",
  },
  {
    serverip: "https://test-yum-backend.vercel.app",
    subscriptionCreated: "2024",
    serverAdmin: "User 5",
    status: "active",
  },
  {
    serverip: "http://localhost:5000",
    subscriptionCreated: "2024",
    serverAdmin: "User 6",
    status: "active",
  },
  {
    serverip: "https://yum-backend.vercel.app",
    subscriptionCreated: "2024",
    serverAdmin: "User 5",
    status: "active",
  },
];

export const createServerSubscription = () => {};

export const checkServerSubscription = asyncHandler(async (req, res) => {
  const { inputServer: userServer } = req.body;
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
