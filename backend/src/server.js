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
import logger from "./utils/logger_utils.js";
import routerCabin from "./routes/cabin_routes.js";
import routerTicket from "./routes/ticket_routes.js";
import { cancelBooking } from "./schedules/cancel_expired_schedules.js"
import routerAircraft from "./routes/aircraft_routes.js";
import passport from "passport";
import session from "express-session";
import { startTicketConsumer } from './utils/kafka/consumer.js';


dotenv.config({ path: "./src/config/config.env" });
const app = express();
const port = process.env.PORT || 3000;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());
app.use("/api/v1/user-core-api", routerAccount, routerAuth);
app.use("/api/v1/payment-core-api", routerPayment);
app.use("/api/v1/booking-core-api", routerBooking);
app.use("/api/v1/flight-core-api", routerFlight);
app.use('/api/v1/airline-core-api', routerAirlines);
app.use('/api/v1/cabin-core-api', routerCabin);
app.use('/api/v1/airport-core-api', routerAirports);
app.use('/api/v1/ticket-core-api', routerTicket);
app.use('/api/v1/aircraft-core-api', routerAircraft);

const startServer = async () => {
  try {
    await connectDB(logger);
    await redisClient.connect();
    console.log('MongoDB & Redis connected');

    app.listen(port, () => {
      logger.info('Server started on port ' + port);
    });

    await startTicketConsumer();
    console.log('Kafka consumer started successfully');

    // Start scheduler

    // setInterval(async () => {
    //   console.log(`[Scheduler] Calling cancelBooking API...`);
    //   await cancelBooking();
    // }, 1000);

  } catch (err) {
    console.error('Failed to initialize server:', err);
  }
};

startServer();

export default app;
