import { Router } from "express";
import { getAirlines, getAirlineById, updateAirline, deleteAirline, createAirline , issueTicketing } from "../controllers/airlines_controller.js";
import { verifyAdmin } from "../middleware/auth.js";

const routerAirlines = Router();

routerAirlines.get("/airlines", getAirlines);
routerAirlines.get("/airline/:id", getAirlineById);
routerAirlines.patch("/airline/:id", verifyAdmin, updateAirline);
routerAirlines.delete("/airline/:id", verifyAdmin, deleteAirline);
routerAirlines.post("/airline", verifyAdmin, createAirline);
routerAirlines.post("/airlines/ticketing", issueTicketing);


export default routerAirlines;
