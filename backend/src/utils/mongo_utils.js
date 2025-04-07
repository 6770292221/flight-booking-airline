// utils/mongo_client.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger_utils.js";

dotenv.config({ path: "./src/config/config.env" });

class MongoClient {
  static instance;

  constructor() {
    if (MongoClient.instance) {
      return MongoClient.instance;
    }

    this.connection = null;

    this.connect();

    MongoClient.instance = this;
  }

  async connect() {
    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      logger.info("MongoDB connected successfully");
    } catch (err) {
      logger.error("MongoDB connection failed: " + err);
      process.exit(1);
    }
  }

  getConnection() {
    return this.connection;
  }

  static getInstance() {
    if (!MongoClient.instance) {
      MongoClient.instance = new MongoClient();
    }
    return MongoClient.instance;
  }
}

export default MongoClient.getInstance().getConnection();
