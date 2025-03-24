import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "../config/config.env" });

const connectDB = async (logger) => {
  try {
    await mongoose.connect(process.env.MONGO_URI , {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};


export default connectDB;
