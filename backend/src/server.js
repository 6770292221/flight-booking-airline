import express from "express";
import dotenv from "dotenv";
import cron from 'node-cron';
import connectDB from "./utils/mongo_utils.js";
import redisClient from './utils/redis_utils.js';
import logger from "./utils/logger_utils.js";
import routerAccount from "./routes/account_routes.js";
import routerAuth from './routes/auth_routes.js';
import routerFlight from "./routes/flights_routes.js";
import routerSeats from "./routes/seats_routes.js";
import routerReservation from "./routes/reservation_routes.js";
import { cancelReservation } from './schedules/cancel_reservation_schedules.js';


dotenv.config({ path: "./src/config/config.env" });
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/v1/flight-core-api", routerFlight, routerSeats);
app.use("/api/v1/user-core-api", routerAccount, routerAuth);
app.use("/api/v1/reservation-core-api", routerReservation);



connectDB(logger);
redisClient.connect();

app.listen(port, () => {
  logger.info(`server started on port ${port}`);
});

// cron.schedule("*/1 * * * *", async () => {
//   console.log(`[Scheduler] Calling cancelReservation API...`);
//   await cancelReservation();
// });

export default app;
