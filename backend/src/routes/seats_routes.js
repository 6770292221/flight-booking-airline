import { Router } from "express";
import { createSeat, deleteSeat, getAllSeats, getSeatById, updateSeat } from "../controllers/seats_controller.js";
import { verifyToken } from "../middleware/auth.js";


const routerFlight = Router();

routerFlight.post("/seat", verifyToken, createSeat);
routerFlight.patch("/seat/:_id", verifyToken, updateSeat);
routerFlight.delete("/seat/:_id", verifyToken, deleteSeat);
routerFlight.get("/seat/:_id", verifyToken, getSeatById);
routerFlight.get("/seat", verifyToken, getAllSeats);



export default routerFlight;
