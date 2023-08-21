import express from "express";
import { config } from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import googleCallbackRouter from "./routes/googleCallbackRouter.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config({
  path: "./config/config.env",
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express({ urlencoded: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  return res.send(`Api is running.`);
});

export default app;

//Auth Routes
app.use("/api/user", userRoutes);

//Workspace Routes
app.use("/api/workspace", workspaceRoutes);

//Google Callback Router
app.use("/", googleCallbackRouter);

// Other Routes
app.use(notFound);
app.use(errorHandler);
