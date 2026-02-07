import mongoose, { Schema } from "mongoose";
import { AvilableTsakStatusEnum, TaskStatusEnum } from "../utils/constants.js";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    discription: String,
    project: {
      type: Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
    assiendTo: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    assiendBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    status: {
      type: String,
      enum: AvilableTsakStatusEnum,
      default: TaskStatusEnum.TODO,
    },
    attachemnts: {
      type: [
        {
          url: String,
          mimetype: String, //what type of file it is (image, pdf, etc.)
          size: Number,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const Task = mongoose.model("Task", taskSchema);
