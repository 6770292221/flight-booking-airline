import { Router } from "express";
import { initiatePayment, webhookHandler } from "../controllers/payment_controller.js";
import { verifyToken } from "../middleware/auth.js";

const routerPayment = Router();

routerPayment.post("/payments/initiate", initiatePayment);
routerPayment.post("/payments/webhook" ,webhookHandler);

export default routerPayment;
