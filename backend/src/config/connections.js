import mongoose from "mongoose";
import logger from "../utils/logger_utils.js";

function createDbConnection(envVarName, dbName) {
  const connectionString = process.env[envVarName];

  if (!connectionString) {
    logger.error(`Environment variable ${envVarName} is not set. Cannot create connection for ${dbName}.`);
    throw new Error(`Configuration Error: Environment variable ${envVarName} is required for ${dbName}.`);
  }

  logger.info(`Creating connection for ${dbName} using environment variable ${envVarName}`);
  const connection = mongoose.createConnection(connectionString);

  connection.on('connected', () => {
    logger.info(`[${dbName}] MongoDB connected successfully.`);
  });

  connection.on('error', (error) => {
    logger.error(`[${dbName}] MongoDB connection error:`, error);
  });

  connection.on('disconnected', () => {
    logger.warn(`[${dbName}] MongoDB disconnected.`);
  });

  return connection;
}

export const flightDb = createDbConnection("FLIGHT_DB_URI", "Flight DB");
export const userDb = createDbConnection("USER_DB_URI", "User DB");
export const paymentDb = createDbConnection("PAYMENT_DB_URI", "Payment DB");
export const bookingDb = createDbConnection("BOOKING_DB_URI", "Booking DB");