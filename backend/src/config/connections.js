import mongoose from "mongoose";
import logger from "../utils/logger_utils.js";

const EVENT_CONNECTED = 'connected';
const EVENT_ERROR = 'error';
const EVENT_DISCONNECTED = 'disconnected';

const ENV_VAR_FLIGHT_DB = "FLIGHT_DB_URI";
const ENV_VAR_USER_DB = "USER_DB_URI";
const ENV_VAR_PAYMENT_DB = "PAYMENT_DB_URI";
const ENV_VAR_BOOKING_DB = "BOOKING_DB_URI";

function createDbConnection(envVarName, dbName) {
  const connectionString = process.env[envVarName];

  if (!connectionString) {
    const errorMsg = `Environment variable ${envVarName} is not set. Cannot create connection for ${dbName}.`;
    logger.error(errorMsg);
    throw new Error(`Configuration Error: Environment variable ${envVarName} is required for ${dbName}.`);
  }

  logger.info(`Creating connection for ${dbName} using environment variable ${envVarName}`);
  const connection = mongoose.createConnection(connectionString);

  connection.on(EVENT_CONNECTED, () => {
    logger.info(`[${dbName}] MongoDB ${EVENT_CONNECTED} successfully.`);
  });

  connection.on(EVENT_ERROR, (error) => {
    logger.error(`[${dbName}] MongoDB connection ${EVENT_ERROR}:`, error);
  });

  connection.on(EVENT_DISCONNECTED, () => {
    logger.warn(`[${dbName}] MongoDB ${EVENT_DISCONNECTED}.`);
  });

  return connection;
}

export const flightDb = createDbConnection(ENV_VAR_FLIGHT_DB, "Flight DB");
export const userDb = createDbConnection(ENV_VAR_USER_DB, "User DB");
export const paymentDb = createDbConnection(ENV_VAR_PAYMENT_DB, "Payment DB");
export const bookingDb = createDbConnection(ENV_VAR_BOOKING_DB, "Booking DB");