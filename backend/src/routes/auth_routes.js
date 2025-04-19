import { Router } from "express";
import {
    loginUser,
    logoutUser,
    verifyEmailOtp,
    googleLoginController,
} from "../controllers/auth_controller.js";
import { verifyToken } from "../middleware/auth.js";
import passport from "passport";
import "../utils/passport.js";

const routerAuth = Router();

// 🧾 Email/Password Login
routerAuth.post("/auth/login", loginUser);
routerAuth.post("/auth/logout", verifyToken, logoutUser);
routerAuth.post("/auth/email-otp/verify", verifyEmailOtp);

// 🌐 Google OAuth
routerAuth.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",       // 🔁 บังคับ refresh token
    prompt: "consent",           // 🔁 บังคับถามสิทธิ์ใหม่
}));

routerAuth.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    googleLoginController
);

export default routerAuth;
