import { Router } from "express";
import {
    getAirports,
    getAirportById,
    createAirport,
    updateAirport,
    deleteAirport,
    getLocations
} from '../controllers/airports_controller.js';
import { verifyAdmin } from "../middleware/auth.js";

const routerAirports = Router();

// CRUD Routes
routerAirports.get("/airports", getAirports);
routerAirports.get("/airports/:id", getAirportById);
routerAirports.post("/airports", createAirport);
routerAirports.put("/airports/:id", updateAirport);
routerAirports.delete("/airports/:id", deleteAirport);
routerAirports.get('/locations', getLocations);


export default routerAirports;
