import asyncHandler from "express-async-handler";
import { User } from "../models/User.js";
import generateToken from "../utils/generateToken.js";

//Register
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all required fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = new User({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the User");
  }
});

//Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

//Get all users
export const searchUser = asyncHandler(async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find({
    ...keyword,
    _id: { $ne: req.user._id },
  });

  res.send(users);
});

//Not working Sign up with Google
export const signupWithGoogle = asyncHandler(async (req, res) => {
  const { name, email, pic } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
    const user = await User.create({
      name,
      email,
      pic,
    });
    console.log(user);
    return res.redirect(process.env.DEV_FRONTEND_URL);
  } catch (error) {
    res.status(400);
    throw new Error("Failed to create the User");
  }
});

//Not working
export const signinWithGoogle = asyncHandler(async (req, res) => {
  const { name, email, pic } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400);
      throw new Error("User not found!");
    }

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400);
    throw new Error("Failed to Sign in the User");
  }
});
