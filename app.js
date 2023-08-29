import express from "express";
import { config } from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import googleCallbackRouter from "./routes/googleCallbackRouter.js";
import userServerRouter from "./routes/userServerRouter.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config({
  path: "./config/config.env",
});

const app = express();

app.use(
  "*",
  cors({
    origin: true,
    credentials: true,
  })
);
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

//userServer Router
app.use("/api/userserver", userServerRouter);

// Other Routes
app.use(notFound);
app.use(errorHandler);
