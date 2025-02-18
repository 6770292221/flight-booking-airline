import { Router } from "express";
import { createAccount, verifyUser } from "../controllers/account_controller.js";
import { verifyToken } from "../middleware/auth.js";


const routerAccount = Router();

routerAccount.post("/register", createAccount);
routerAccount.post("/verifyUser", verifyToken, verifyUser);


export default routerAccount;
