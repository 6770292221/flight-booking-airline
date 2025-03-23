import express from "express";
import dotenv from "dotenv";
import cron from 'node-cron';
import connectDB from "./utils/mongo_utils.js";
import redisClient from './utils/redis_utils.js';
import logger from "./utils/logger_utils.js";
import routerAccount from "./routes/account_routes.js";
import routerAuth from './routes/auth_routes.js';
import routerBooking from './routes/booking_routes.js';
import { cancelReservation } from './schedules/cancel_reservation_schedules.js';
import routerPayment from "./routes/payment_routes.js";
import cors from "cors";
import mailService from './utils/mail_utils.js'

dotenv.config({ path: "./src/config/config.env" });
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use("/api/v1/user-core-api", routerAccount, routerAuth);
app.use("/api/v1/payment-core-api", routerPayment);
app.use("/api/v1/booking-core-api", routerBooking);



connectDB(logger);
redisClient.connect();

app.listen(port, () => {
  mailService.sendEmail(
    'mindwua@gmail.com',
    'Test Email',
    'Hello! This is a test email from the singleton MailService.'
  );
  console.log('Notification email sent successfully.');
  logger.info(`server started on port ${port}`);
});

// cron.schedule("*/1 * * * *", async () => {
//   console.log(`[Scheduler] Calling cancelReservation API...`);
//   await cancelReservation();
// });

export default app;
