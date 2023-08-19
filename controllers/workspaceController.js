import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import { Workspace } from "../models/Workspace.js";

export const accessWorkspace = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  let isWorkspace = await Workspace.find({
    $and: [{ users: { $elemMatch: { $eq: req.user._id } } }],
  }).populate("users", "-password");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    return res.send(isChat[0]);
  } else {
    let chatData = {
      workspaceName: "sender",
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      return res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

export const fetchAllWorkspaces = asyncHandler(async (req, res) => {
  try {
    Workspace.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("workspaceAdmin", "-password")
      .sort({ updated: -1 })
      .then(async (results) => {
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const createWorkspace = asyncHandler(async (req, res) => {
  if (!req.body.workspaceName || !req.body.users) {
    return res.status(400).send({
      message: "Please fill all the required fields",
    });
  }

  //from frontend we have an array of users and those will be sent at backend
  //using stringyfy() because we cannot directly send an array. Now to parse that string we use JSON.parse()
  let users = JSON.parse(req.body.users);

  //If number of users is less than 2, we will not allow to form a group
  // if (users.length < 2) {
  //   return res.status(400).send("More than 2 users required to form a group");
  // }

  //Add the currently login user to group or groupAdmin(you can say)
  users.push(req.user);

  try {
    //Create group chat
    const workspace = await Workspace.create({
      workspaceName: req.body.workspaceName,
      users: users,
      workspaceAdmin: req.user,
    });

    //Now we fetch this chat and send it to the user
    const fullWorkspace = await Workspace.findOne({ _id: workspace._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(fullWorkspace);
  } catch (error) {
    throw new Error(error.message);
  }
});

export const renameWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, workspaceName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true, // it will return updated value
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  //Check if any errors
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.status(200).json(updatedChat);
  }
});

export const addToWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, userToBeAddedId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    workspaceId,
    {
      $push: { users: userToBeAddedId }, //Add a new user
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("workspaceAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Workspace not found");
  } else {
    res.status(200).json(added);
  }
});

export const removeFromWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId, userToBeRemovedId } = req.body;

  const removed = await Workspace.findByIdAndUpdate(
    workspaceId,
    {
      $pull: { users: userToBeRemovedId }, //Add a new user
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("workspaceAdmin", "-password");

  if (!removed) {
    return res.status(404);
    throw new Error("Workspace not found");
  } else {
    return res.status(200).json(removed);
  }
});
