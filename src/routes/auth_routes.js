import { Router } from "express";
import { loginUser, logoutUser, verifyTokenUser } from "../controllers/auth_controller.js";
import { verifyToken } from "../middleware/auth.js";
const routerAuth = Router();

routerAuth.post("/auth/login", loginUser);
routerAuth.post("/auth/logout", verifyToken, logoutUser);
routerAuth.get('/auth/verifyToken', verifyToken, verifyTokenUser);



export default routerAuth;
