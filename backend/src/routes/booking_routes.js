import { Router } from "express";
import {
    createBooking,
    getBookingById,
    updateBooking,
    deleteBooking,
    updateTickets,
    updatePayments,
    getMyBookings,
    getAllBookingsByAdmin,
    cancelExpiredBookings,
    cancelMyBooking
} from "../controllers/booking_controller.js";

import { verifyToken } from "../middleware/auth.js";

const routerBooking = Router();

routerBooking.post("/booking", verifyToken, createBooking);
routerBooking.get("/booking/:_id", verifyToken, getBookingById);
routerBooking.patch("/booking/:_id", verifyToken, updateBooking);
routerBooking.delete("/booking/:_id", verifyToken, deleteBooking);
routerBooking.patch("/booking/tickets/:_id", updateTickets);
routerBooking.patch("/booking/payments/:_id", updatePayments);
routerBooking.get("/my/booking", verifyToken, getMyBookings);
routerBooking.get("/admin/booking", verifyToken, getAllBookingsByAdmin);
routerBooking.patch('/bookings/cancel-expired', cancelExpiredBookings);
routerBooking.patch('/booking/:_id/cancel', verifyToken, cancelMyBooking);




export default routerBooking;
