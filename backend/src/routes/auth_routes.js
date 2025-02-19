import { Router } from "express";
import { loginUser, logoutUser, verify2fa } from "../controllers/auth_controller.js";
import { verifyToken, getTokenData } from "../middleware/auth.js";
const routerAuth = Router();

routerAuth.post("/auth/login", loginUser);
routerAuth.post("/auth/logout", verifyToken, logoutUser);
routerAuth.post('/auth/verify2fa', getTokenData, verify2fa);


export default routerAuth;
