import { Router } from "express";
import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getcurrentUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { login } from "../controllers/auth.controller.js";
import { validte } from "../middleware/validator.middleware.js";
import {
  userChangeCurrentPassword,
  userRegisterValidator,
  userResetForgotPasswordValidator,
  userforgotPasswordValidator,
  userloginValidator,
} from "../validators/index.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
// import { UserloginValidator } from "../validators/index.js";
const router = Router();

// unsecured route
router.route("/register").post(userRegisterValidator(), validte, registerUser); //userRegisterValidator() returns middleware functions .validate already is a middleware function  .Express expects functions, not function calls
router.route("/login").post(userloginValidator(), validte, login);
router.route("/verify-email:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-password")
  .post(userforgotPasswordValidator(), validte, forgotPasswordRequest);
router
  .route("/reset-password:resetToken")
  .post(userResetForgotPasswordValidator(), validte, resetForgotPassword);

//secure routes it maens it will reqired to verifyjwt
router.route("/logout").post(verifyJwt, logoutUser); //for logOut we can use any postor get that will not bother much
router.route("/current-user").post(verifyJwt, getcurrentUser);
router
  .route("/change-password")
  .post(verifyJwt, userChangeCurrentPassword(), validte, changeCurrentPassword);
router
  .route("/resend-email-varificaton")
  .post(verifyJwt, resendEmailVerification);

export default router;
