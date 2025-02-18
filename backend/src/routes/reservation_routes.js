import { Router } from "express";
import { createReservation, getAllReservations, updateExpiredReservations } from "../controllers/reservation_controller.js";
import { verifyToken } from "../middleware/auth.js";


const routerReservation = Router();

routerReservation.post("/reservation", verifyToken, createReservation);
routerReservation.get("/reservation", verifyToken, getAllReservations);
routerReservation.patch("/reservation/expire", updateExpiredReservations);



export default routerReservation;
