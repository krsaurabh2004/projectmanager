import { User } from "../models/user.models.js";
import asyncHandler from "../utils/async-handler.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-Error.js";
// import sendEmail from "../utils/mail.js";
import {
  emailVerificationMailgenContent,
  sendEmail,
  forgotpasswordMailgenContent,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    //firstly we find the user using the method findById
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found while generating tokens");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("ACTUAL TOKEN ERROR 👉", error);
    throw new ApiError(500, error.message);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //step1. how do we accept data from the frontend(dta can come from body,prams,headers)
  const { email, username, password, role } = req.body; //req.body takes data from frontend

  //step2. we had taken data from frontend now checking in DB if user alrady exist

  const existedUser = await User.findOne({
    //findOne is the method to find the data from the data base
    $or: [{ username }, { email }], //either you find username or email
  });

  //part where we found the user
  if (existedUser) {
    throw new ApiError(409, "user with email and username already exists ", []); //this will throw an error if user already exist
  }

  //4. Save the new user
  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  //send email to the usear
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemproryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  //
  await sendEmail({
    email: user?.email, // if ue have the user we will decaode its email
    subject: "please vrify yours email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}`, // protocol:https,grt("host"):chaicode.com,route:verify-email, this what we will be sending to the user when ever he  will click to it this url he will get
    ),
  });
  //user contain all the data(avatar,username....) we don't need to sendback all the data( this is the way to send thr selected data from the user merthod) by this you can mark each field as null as well we have used select method that it does is select(takes a string we provide a dash that miens don't want)

  await User.findById(user._id).select(
    "-password -emailVerificationToken -refreshToken  -emailVerificationExpiry",
  );

  if (!user) {
    throw new ApiError(500, "somthimg went wrong while registring a user");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user },
        "user registration successfully and verification email has been sent on",
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email) {
    throw new ApiError(400, " email is required");
  }

  //find the user this is a databse opration we has yoused the await function
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "user does not exists");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );
  console.log("accesstoken", accessToken);
  const loggedInUser = await User.findById(user._id).select(
    "-password -emailVerificationToken -refersehToken  -emailVerificationExpiry",
  );

  //this is done to set the accesToken and the refreshToken
  const options = {
    httpOnly: true, //This cookie cannot be accessed by JavaScript in the browser.
    secure: true, //The cookie will be sent only over HTTPS, not HTTP.
  };

  //send the rsponse and set the cookies
  return (
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      //Cookie name: "accessToken"
      // Cookie value: accessToken (JWT string)
      // options: security settings like:
      // httpOnly: true
      // secure: true
      // sameSite: "strict
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged in successfully",
        ),
      )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        //mongoDB update oprator
        refreshToken: "",
      },
    },
    {
      new: true, // this option tell tha mongoose return the updated  document, not the old one.
    },
  ); //you added two parametrs fistone is what you needed to find and second one is what you r upddating

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getcurrentUser = asyncHandler(async (req, res) => {
  return res //req hase the user access
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params; // extract the token from the URL path of the route
  console.log("verificationToken", verificationToken);

  if (!verificationToken) {
    throw new ApiError(400, "email verification token is missnig");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken, //data base mai hashed vesion save hoga
    emailVerificationExpiry: { $gt: new Date() }, //$gt is a MoongoDB comparison operator that stans for greater than  and  $gte means greater then or eaqual to
  });
  console.log("date", new Date());
  console.log("user", user);

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired");
  }

  // user.emailVerificationToken = undefined;
  // user.emailVerificationExpiry = undefined;

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: true,
      },
      "email is verified",
    ),
  );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  // the resend verification csn only be send by theuser who has been loged in

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "user does not exixt");
  }
  if (user.isEmailVerified) {
    throw new ApiError(409, "email is already verified"); //409 becuse what you trying to do the already done
  }
  //this is email verifcation process
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemproryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  //
  await sendEmail({
    email: user?.email, // if ue have the user we will decaode its email
    subject: "please vrify yours email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}`, // protocol:https,grt("host"):chaicode.com,route:verify-email, this what we will be sending to the user when ever he  will click to it this url he will get
    ),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "mail has been sentt to your email ID"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken; //Server extracts refresh token from request.
  console.log(" incomingRefreshToken", incomingRefreshToken);
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access"); //401 indicate that the request has not been applied
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken?.id);
    if (!user) {
      throw new ApiError(401, "invalid refresh Token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      // here we rr chaking the data bes here if the refresh tokn is here or not
      throw new ApiError(401, "refresh token is expired");
    }
    const options = {
      httpOnl: true,
      secure: true,
    };
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refresh",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "invalid refresh Token");
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  // this is the process of forgotPassword request
  //user se eamil liya and veify kiya if user exist
  // aek temprory token genrate kraya uska hashed version apne database mai save kiya nad unhased version send kiya user ko through an email

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "user does not exists", []);
  }
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemproryToken();

  user.forgotpasswordToken = hashedToken; //we are saving hashed reset token into the user's database record.
  user.forgotpasswordExpiry = tokenExpiry; // this stores the expiry time in database.

  await user.save({ validateBeforeSave: false }); //udate the user document to the database without runing schema validations.
  await sendEmail({
    email: user?.email, // if ue have the user we will decaode its email "use the email only if user exists, otherwise don’t crash."
    subject: "password reset request",
    mailgenContent: forgotpasswordMailgenContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  });

  return res.status(200).json(new ApiResponse(200, {}, "password reset"));
});

const resetForgotPassword = asyncHandler(async (req, res) => {
  //user ko jho unhashed token will act as an url and open a new page where user enter the new password
  const { resetToken } = req.params; //geting data from url
  const { newPassword } = req.body;

  const hashedToken = crypto //crypto node.js built in security libraray
    .createHash("sha256") // SHA_256 a strong cryptographic hashing algorithum
    .update(resetToken) // takes the resetToken and put it in hashing machine
    .digest("hex"); //The hash result is converted into a hexadecimal string

  const user = await User.findOne({
    forgotpasswordToken: hashedToken, //storing the hashedToken in the data base
    forgotpasswordExpiry: { $gt: Date.now }, //tis is the expiry time of the token in data base
  });

  if (!user) {
    throw new ApiError(489, "Token is inavlid or expiry");
  }
  user.forgotpasswordExpiry = undefined;
  user.forgotpasswordToken = undefined;

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "password reset"));
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log("BODY:", req.body);
  console.log("oldPassword:", req.body.oldPassword);
  console.log("newPassword:", req.body.newPassword);

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "invalid old password");
  }
  user.password = newPassword;
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});
export {
  registerUser,
  login,
  logoutUser,
  getcurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
};

//algorithum for registration
// 1. take some data
// 2. validte the data
// 3. check in db if user alrady exists
// 4. Save the new user(Access token, RAGISTER token,Grand token, sendmail)
// 5.user varification => email
// 6. sends response back to the request

//How do a user get loggedOut
//

//steps to get the current user
//1.
