import express from "express";
import dotenv from "dotenv";
import cron from 'node-cron';
import connectDB from "./utils/mongo_utils.js";
import redisClient from './utils/redis_utils.js';
import routerAccount from "./routes/account_routes.js";
import routerAuth from './routes/auth_routes.js';
import routerBooking from './routes/booking_routes.js';
import routerPayment from "./routes/payment_routes.js";
import cors from "cors";
import routerFlight from "./routes/flights_routes.js";
import routerAirports from "./routes/airports_routes.js";
import routerAirlines from "./routes/airlines_routes.js";
import {Logger} from "./state/logger_state.js";
import routerCabin from "./routes/cabin_routes.js";



dotenv.config({ path: "./src/config/config.env" });
const app = express();
const port = process.env.PORT || 3000;
const logger = new Logger();

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use("/api/v1/user-core-api", routerAccount, routerAuth);
app.use("/api/v1/payment-core-api", routerPayment);
app.use("/api/v1/booking-core-api", routerBooking);
app.use("/api/v1/flight-core-api", routerFlight);
app.use('/api/v1/airline-core-api', routerAirlines);
app.use('/api/v1/cabin-core-api', routerCabin);
app.use('/api/v1/airport-core-api', routerAirports);

connectDB(logger);
redisClient.connect();

app.listen(port, () => {
  logger.log('Notification email sent successfully.');
  logger.log(`server started on port ${port}`);
});

// cron.schedule("*/1 * * * *", async () => {
//   console.log(`[Scheduler] Calling cancelReservation API...`);
//   await cancelReservation();
// });

export default app;
