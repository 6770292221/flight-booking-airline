import { Router } from "express";
import { getAircrafts, getAircraftById, updateAircraft, deleteAircraft, createAircraft } from "../controllers/aircrafts_controller.js";
import { verifyAdmin } from "../middleware/auth.js";

const routerAircraft = Router();

routerAircraft.get("/aircrafts", getAircrafts);
routerAircraft.get("/aircraft/:id", getAircraftById);
routerAircraft.patch("/aircraft/:id", verifyAdmin, updateAircraft);
routerAircraft.delete("/aircraft/:id", verifyAdmin, deleteAircraft);
routerAircraft.post("/aircraft", verifyAdmin, createAircraft);


export default routerAircraft;
