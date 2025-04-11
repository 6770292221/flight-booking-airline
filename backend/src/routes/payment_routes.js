import { Router } from "express";
import { getAllPayments, getPaymentById, initiatePayment, webhookHandler, getPaymentByBookingId } from "../controllers/payment_controller.js";
import { verifyToken } from "../middleware/auth.js";

const routerPayment = Router();

routerPayment.post("/payments/initiate", initiatePayment);
routerPayment.post("/payments/webhook", webhookHandler);

routerPayment.get("/payments", verifyToken, getAllPayments);
routerPayment.get("/payments/:id", verifyToken, getPaymentById);
routerPayment.get("/payment/booking/:bookingId", verifyToken, getPaymentByBookingId);

export default routerPayment;
