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
    videos: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        video: {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
        status: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.model("Workspace", schema);
