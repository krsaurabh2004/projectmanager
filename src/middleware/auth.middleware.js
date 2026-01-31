import { User } from "../models/user.models.js";
import ApiError from "../utils/api-Error.js";
import asyncHandler from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

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
