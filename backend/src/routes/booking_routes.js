import { Router } from "express";
import {
    createBooking,
    getBookingById,
    updateBooking,
    deleteBooking,
    updatePayments,
    getMyBookings,
    getAllBookingsByAdmin,
    cancelExpiredBookings,
    cancelMyBooking,
    requestTicketIssued
} from "../controllers/booking_controller.js";

import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const routerBooking = Router();

routerBooking.post("/booking", verifyToken, createBooking);
routerBooking.get("/booking/:_id", verifyToken, getBookingById);
routerBooking.patch("/booking/:_id", verifyToken, updateBooking);
routerBooking.delete("/booking/:_id", verifyToken, deleteBooking);
routerBooking.patch("/booking/payments/:_id", updatePayments);
routerBooking.get("/my/booking", verifyToken, getMyBookings);
routerBooking.get("/admin/booking", verifyAdmin, getAllBookingsByAdmin);
routerBooking.patch('/bookings/cancel-expired', cancelExpiredBookings);
routerBooking.patch('/booking/:_id/cancel', verifyToken, cancelMyBooking);
routerBooking.post('/bookings/:id/request-ticket-issued', requestTicketIssued);



export default routerBooking;
