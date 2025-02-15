import { Router } from "express";
import { createReservation, getAllReservations } from "../controllers/reservation_controller.js";
import { verifyToken } from "../middleware/auth.js";


const routerReservation = Router();

routerReservation.post("/reservation", verifyToken, createReservation);
routerReservation.get("/reservation", verifyToken, getAllReservations);




export default routerReservation;
