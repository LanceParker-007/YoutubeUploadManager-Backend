import express, { urlencoded } from "express";
import { config } from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import cors from "cors";

config({
  path: "./config/config.env",
});

const app = express();

// app.use(cors());
app.use(express.json());
app.use(express({ urlencoded: true }));

app.get("/", (req, res) => {
  return res.send(`Api is running.`);
});

//Auth Routes
app.use("/api/user", userRoutes);

//Workspace Routes
app.use("/api/workspace", workspaceRoutes);

// Other Routes
app.use(notFound);
app.use(errorHandler);

export default app;
