import { Router } from "express";
import {
    getAirports,
    getAirportById,
    createAirport,
    updateAirport,
    deleteAirport
} from '../controllers/airports_controller.js';
import { verifyAdmin } from "../middleware/auth.js";

const routerAirports = Router();

// CRUD Routes
routerAirports.get("/airports", getAirports);
routerAirports.get("/airports/:id", getAirportById);
routerAirports.post("/airports", verifyAdmin ,createAirport);
routerAirports.put("/airports/:id", verifyAdmin,updateAirport);
routerAirports.delete("/airports/:id",verifyAdmin ,deleteAirport);

export default routerAirports;
