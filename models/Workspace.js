import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    workspaceName: {
      type: "string",
      trim: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId, //ref to that particulat user
        ref: "User",
      },
    ],
    workspaceAdmin: {
      type: mongoose.Schema.Types.ObjectId, //ref to that particulat user
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.model("Chat", schema);
