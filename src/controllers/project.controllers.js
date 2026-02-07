import { User } from "../models/user.models.js";
import { project } from "../models/project.models.js";
import { projectmember } from "../models/projectmember.models.js";
import asyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-Error.js";
import {
  emailVerificationMailgenContent,
  sendEmail,
  forgotpasswordMailgenContent,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";

const getProjects = asyncHandler(async (req, res) => {
  //test
});
const getProjectsById = asyncHandler(async (req, res) => {
  //test
});

const creatProejcts = asyncHandler(async (req, res) => {
  const { name, discription } = req.body; //req name and discription from the model
  const project = await project.create({
    //.create is the mathod
    name,
    discription,
    cereatedBy: new mongoose.Types.ObjectId(req.user._id), // this will give you a mongodb Id
  }); //this create the project

  await projectmember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserroleEnum.ADMIN,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, project, "project Created successfully"));
});

const updateProjects = asyncHandler(async (req, res) => {
  const { name, discription } = req.body;
  const { projectId } = req.params;
  const project = await project.findByIdAndUpdate(
    projectId, //what id you r updating
    {
      // what data you r updating
      name,
      discription,
    },
    { new: true },
  );
  if (!project) {
    throw new ApiError(404, "project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "project updated successfully"));
});

const deletProjects = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  await project.findByIdAndDelete(projectId);
  if (!project) {
    throw new ApiError(404, "project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "project deleted successfully"));
});

const addMemebersToProjects = asyncHandler(async (req, res) => {
  //test
});
const getProjectMembers = asyncHandler(async (req, res) => {
  //test
});
const updateProjectMembers = asyncHandler(async (req, res) => {
  //test
});
const deletMember = asyncHandler(async (req, res) => {
  //test
});

export {
  getProjects,
  getProjectsById,
  creatProejcts,
  updateProjects,
  deletProjects,
  addMemebersToProjects,
  getProjectMembers,
  updateProjectMembers,
  deletMember,
};
