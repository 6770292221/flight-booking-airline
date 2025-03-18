import { Router } from "express";
import { createPayment } from "../controllers/payment_controller.js";
import { verifyToken } from "../middleware/auth.js";

const routerPayment = Router();

routerPayment.post("/createPayment", verifyToken, createPayment);

export default routerPayment;
