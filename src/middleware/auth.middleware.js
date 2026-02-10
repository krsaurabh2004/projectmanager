import { User } from "../models/user.models.js";
import { projectmember } from "../models/projectmember.models.js";
import ApiError from "../utils/api-Error.js";
import asyncHandler from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  //extarct the token
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", ""); //this is encoded token   req.cookies?.accessToken preventclash if cookies is undefined the cookie name is accessToken
  if (!token) {
    throw new ApiError(401, "Unauthoized request");
  }

  //decode the token
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //this will automaticlly decode the  accesstoken
    const user = await User.findById(decodedToken?._id).select(
      "-password -emailVerificationToken -refersehToken  -emailVerificationExpiry",
    );

    if (!user) {
      throw new ApiError(401, "invalid access token");
    }
    req.user = user; //in user we will had teh information "-password -emailVerificationToken -refersehToken  -emailVerificationExpiry"apart from
    next();
  } catch (error) {
    console.error("ACTUAL TOKEN ERROR 👉", error);
    throw new ApiError(401, error.message);
    // throw new ApiError(401, "invalid access token");
  }
});

// plan for this file
// 1. intersept the request in the middlweare
// 2. access the accesstoken
// 3. once you access the accessToken decode it and extarct the data
// 4. onec you have he decoded information inject in req={}

export const validateprojectPermission = (role = []) => {
  //when ever a person uses this method we recive a roles
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    if (!projectId) {
      throw new ApiError(400, "project Id missing");
    }

    //by this yoy found the projectmember documnet
    const project = await projectmember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      project: new mongoose.Types.ObjectId(req.user._id),
    });

    if (!project) {
      throw new ApiError(400, "project not found");
    }

    const givenRole = project?.role; //if the project exists take out the rolr from it // there role is taken from the database

    req.user.role = givenRole; //adding given role to the user
    //check the connection between the proviede role and conncetion role
    if (!roles.includes(givenRole)) {
      //this  line sayes is this role is includes in the given role if not it will throw the error
      throw new ApiError(
        403,
        "you do not have permission to perform this action",
      );
    }
  });
};
