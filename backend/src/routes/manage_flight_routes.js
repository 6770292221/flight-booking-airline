import { Router } from "express";
import { verifyToken, getTokenData } from "../middleware/auth.js";
const routerManage = Router();

routerManage.get("/airports", updateAireports);


export default routerManage;
