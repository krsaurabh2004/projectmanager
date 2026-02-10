import { User } from "../models/user.models.js";
import { project } from "../models/project.models.js";
import { projectmember } from "../models/projectmember.models.js";
import asyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-Error.js";
import mongoose from "mongoose";
import { AvailableUserRole } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await projectmember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "proejcts",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "projects",
              as: "proejctmembers",
            },
          },
          {
            $addFieleds: {
              members: {
                $size: "$projectmemebers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "project",
    },
    {
      $project: {
        project: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          createdBy: 1,
        },
        role: 1,
        _id: 0,
      },
    },
  ]);
  return res.status(200).json(200, projects, "project fetched succeddfully");
});
const getProjectsById = asyncHandler(async (req, res) => {
  //  taking projectId from the url and searching in the database if it is found we returning it else throwing the error message through ApiError
  const { projectId } = req.params;
  const project = await project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, project, "project featched successfully"));
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
  //what you neede to add a member to a project you need a email is and username of the person to whom you r adding and you need a projectId in which you will add him

  const { email, role } = req.body;
  const { projectId } = req.params;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "user does not exists");
  }
  await projectmember.findByIdAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role: role,
    },
    {
      new: true, // it will return me the updated data insted of old data
      upsert: true, //if document exists update it if not create new document
    },
  );

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "project memeber added successfully"));
});
const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await project.findById(req.params);
  if (!project) {
    throw new ApiError(404, "project not found");
  }

  const projectmembers = await projectmember.aggregate([
    {
      $mtach: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        user: {
          $arrayElemAt: ["$user", 0],
        },
      },
    },
    {
      $project: {
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projectmembers, "project members fetched"));
});
const updateMemberRole = asyncHandler(async (req, res) => {
  //need id of the user and project
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  //check role is available or not
  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, "Invalid role");
  }

  let projectmembers = await projectmember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });
  if (!projectmembers) {
    throw new ApiError(400, "member not found");
  }
  await projectmember.findByIdAndUpdate(
    projectmembers._id,
    {
      role: newRole,
    },
    { new: true },
  );
  if (!projectmembers) {
    throw new ApiError(400, "project Membar not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectmembers,
        "project member role updated successfully",
      ),
    );
});
const deletMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectmembers = await projectmember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });
  if (!projectmembers) {
    throw new ApiError(400, "memebr not found");
  }
  await projectmember.findByIdAndDelete(projectmembers._id);
  if (!projectmembers) {
    throw new ApiError(400, "project Membar not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectmembers,
        "project member role deleted successfully",
      ),
    );
});

export {
  getProjects,
  getProjectsById,
  creatProejcts,
  updateProjects,
  deletProjects,
  addMemebersToProjects,
  getProjectMembers,
  updateMemberRole,
  deletMember,
};
