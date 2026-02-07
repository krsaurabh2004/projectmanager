import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    discription: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId, //refer to another document
      ref: "User", //This field is a reference (relationship) to a User document.”  this what they will together do
      required: true,
    },
  },
  { timestamp: true },
); // timestamp:true this will automaticly add the when the document was created and updated
export const project = mongoose.model("project", projectSchema);
