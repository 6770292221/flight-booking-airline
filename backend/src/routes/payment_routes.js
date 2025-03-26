import { Router } from "express";
import { initiatePayment } from "../controllers/payment_controller.js";
import { verifyToken } from "../middleware/auth.js";

const routerPayment = Router();

routerPayment.post("/payments/initiate", initiatePayment);

export default routerPayment;
