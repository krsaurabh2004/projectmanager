import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://placehold.co/600x400`,
        localPath: ``,
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowecase: true,
      unique: true,
    },
    fullName: {
      type: String,
      trime: true,
    },
    password: {
      type: String,
      required: [true, "password is required"], //coustmised way of writing a warning if not filled the warning will be shown
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotpasswordToken: {
      type: String,
    },
    forgotpasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  }, //all the filds
  {
    timestamp: true,
  },
);
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; //this field will be touches for the first time as well as the time when you modify the password this ia saving from the case when password is not edited
  this.password = await bcrypt.hash(this.password, 10); //10 here is encryption round
});

// methods to verify the password you r giving is same as the previous(the hash password will be diffrent for the diffrnt string )
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); //.hashes the entered password , .comapres it with the stored hash
  //   Takes 123456
  // Runs it through same bcrypt algorithm
  // Checks if it matches stored encrypted version
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    }, //this is payload
    process.env.ACCESS_TOKEN_SECRET,

    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }, //secret
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};
userSchema.methods.generateTemproryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 20 * 60 * 1000; //20 mins
  console.log(tokenExpiry);
  return (unHashedToken, hashedToken, tokenExpiry);
  //. what method usually
  //. creat a random token
  //. creat hashed version of that token
  //. set an expiry time
};

export const User = mongoose.model("User", userSchema);
