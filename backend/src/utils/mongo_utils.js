import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "../config/config.env" });

const connectDB = async (logger) => {
  try {
    await mongoose.connect(process.env.MONGO_URI , {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.log("MongoDB connected successfully", "info");
  } catch (error) {
    logger.log("MongoDB connection failed:" + error, "error");
    process.exit(1);
  }
};


export default connectDB;
