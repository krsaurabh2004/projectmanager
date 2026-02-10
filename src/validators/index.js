import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants.js";

//VALIDATION
// It returns an array of validation middleware

export const userloginValidator = () => {
  return [
    body("email")
      .optional()
      .trim()
      .isEmail() // it shoud be in formate of email
      .withMessage("Email is invalid"),
    body("password").trim().notEmpty().withMessage("password is required"),
  ];
};

export const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail() // it shoud be in formate of email
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("username is reqired")
      .isLowercase()
      .withMessage("username must be in Lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("password").trim().notEmpty().withMessage("password is required"),
    body("fullname").optional().trim(),
  ];
};

export const userChangeCurrentPassword = () => {
  return [
    body("oldPassword").notEmpty().withMessage("old password is required"),
    body("newPassword").notEmpty().withMessage("new password is required"),
  ];
};

export const userforgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is invalid"),
  ];
};

export const userResetForgotPasswordValidator = () => {
  return [body("newPassword").notEmpty().withMessage("password is required")];
};

export const createProjectValidator = () => {
  return [
    body("name").notEmpty().withMessage("name is reuired"),
    body("description").optional(),
  ];
};

export const addMembertoProjectvalidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is rquired")
      .isEmail()
      .withMessage("email is invalid"),
    body("role")
      .notEmpty()
      .withMessage("role is required")
      .isIn(AvailableUserRole) //this  check wather somthing avilable or not ,
      .withMessage("role is invalid"),
  ];
};
//userRegistervalidator  A __________express-validator__________B
// a will ower middlerware and validation will go up in routes in whisch it will bw processed request hss be reached to the route now it being wating be the processed by  userRegisterValidator(we will call the userRegistervalidator because this is a function nad it will run ) all the stuff in userRegistervalidator wll be processed and collec the errors
//now validate is bringed which done all the task of its won validator is not being called or run because it not a function

// we write middleware_______ validator_____route
