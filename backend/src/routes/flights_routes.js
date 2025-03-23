import { Router } from "express";
// import { createFlight, deleteFlight, getAllFlights, updateFlight, getFlightsOffer } from "../controllers/flights_controller.js";
import {postFlightsOffer} from '../controllers/flight_controller.js'
import { verifyToken } from "../middleware/auth.js";


const routerFlight = Router();
// routerFlight.post("/flight", verifyToken, createFlight);
// routerFlight.put("/flight/:flightNumber", verifyToken, updateFlight);
// routerFlight.get("/flights", verifyToken, getAllFlights);
// routerFlight.delete("/flight/:flightNumber", verifyToken, deleteFlight);


routerFlight.post("/flights", postFlightsOffer);

export default routerFlight;
