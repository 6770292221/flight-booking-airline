import { Router } from "express";
import { loginUser, logoutUser, smsOtpVerify } from "../controllers/auth_controller.js";
import { verifyToken, getTokenData } from "../middleware/auth.js";
const routerAuth = Router();

routerAuth.post("/auth/login", loginUser);
routerAuth.post("/auth/logout", verifyToken, logoutUser);
routerAuth.post('/auth/sms-otp/verify', getTokenData, smsOtpVerify);


export default routerAuth;
