import { Router } from "express";
import {postFlightsOffer} from '../controllers/flight_controller.js'


const routerFlight = Router();


routerFlight.post("/flights", postFlightsOffer);

export default routerFlight;
