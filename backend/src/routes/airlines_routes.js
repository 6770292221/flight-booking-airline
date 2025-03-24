import { Router } from "express";
import { getAirlines, getAirlineById, updateAirline, deleteAirline, createAirline } from "../controllers/airlines_controller.js";

const routerAirlines = Router();

routerAirlines.get("/airlines", getAirlines);
routerAirlines.get("/airline/:id", getAirlineById);
routerAirlines.patch("/airline/:id", updateAirline);
routerAirlines.delete("/airline/:id", deleteAirline);
routerAirlines.post("/airline", createAirline);


export default routerAirlines;
