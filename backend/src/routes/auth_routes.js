import { Router } from "express";
import { loginUser, logoutUser, verifyEmailOtp } from "../controllers/auth_controller.js";
import { verifyToken } from "../middleware/auth.js";
const routerAuth = Router();

routerAuth.post("/auth/login", loginUser);
routerAuth.post("/auth/logout", verifyToken, logoutUser);
routerAuth.post('/auth/email-otp/verify', verifyEmailOtp);


export default routerAuth;
