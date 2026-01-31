import { validationResult } from "express-validator";
import ApiError from "../utils/api-Error.js";

//MIDDLEWARE
export const validte = (req, res, next) => {
  // this is a middleware most of the time it will reqiurs (req ,res, next) here next is actin like a flag next is telling to the express-validator that now my job is done you can move to the next validator or  middleware
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = []; //creste an empty arry

  errors.array().map(
    (
      err, // error.array() it extract the errors from the expres validator  .map((err)=>....) this line loops through the error and push in the empty array
    ) =>
      extractedErrors.push({
        [err.path]: err.msg, //  err.path is "key" and  err.mag is the value somthing like this [{"email: "email is reqiured},{......},]
      }),
  );
  console.log("extarctedErrors", extractedErrors);
  throw new ApiError(422, "recived data is not valid", extractedErrors);
};
