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
        youtubeId: {
          type: String,
          required: false,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
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
        thumbnail: {
          public_id: {
            type: String,
            required: false,
          },
          url: {
            type: String,
            required: false,
          },
        },
        category: {
          type: String, // You can specify this as a String or another type based on your category system.
          required: false,
        },
        tags: [
          {
            type: String,
            required: false,
          },
        ],
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
