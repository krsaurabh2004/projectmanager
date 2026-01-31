import mongoose from "mongoose";

// mongoose.connect(process.env.MONGO_URI)  IS NOT A GOOD IDEA MAY BE CONNECTION IS GOOD MAY BE COONECTION IS NOT GOOD MAY BE MONGODB IS CONNECTED MAY NOT BE NOT CONNECTED

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL); // it wlll take some time so we had ued await
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MondoDB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
