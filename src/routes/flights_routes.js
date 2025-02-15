import { Router } from "express";
import { createFlight, deleteFlight, getAllFlights, updateFlight } from "../controllers/flights_controller.js";
import { verifyToken } from "../middleware/auth.js";


const routerFlight = Router();

routerFlight.post("/flight", verifyToken, createFlight);
routerFlight.put("/flight/:flightNumber", verifyToken, updateFlight);
routerFlight.get("/flights", verifyToken, getAllFlights);
routerFlight.delete("/flight/:flightNumber", verifyToken, deleteFlight);



export default routerFlight;
