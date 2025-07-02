import { Router } from "express";
import { getCabinClasses, getCabinClassById, createCabinClass, deleteCabinClass, updateCabinClass } from '../controllers/cabin_controller.js'
import { verifyAdmin } from "../middleware/auth.js";

const routerCabin = Router();

routerCabin.get("/cabin-classes", getCabinClasses);
routerCabin.get("/cabin-class/:id", getCabinClassById);
routerCabin.post("/cabin-class", createCabinClass);
routerCabin.patch("/cabin-class/:id", updateCabinClass);
routerCabin.delete("/cabin-class/:id", deleteCabinClass);


export default routerCabin;
