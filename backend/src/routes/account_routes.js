import { Router } from "express";
import { createAccount, verifyUser } from "../controllers/account_controller.js";
import { getTokenData } from "../middleware/auth.js";


const routerAccount = Router();

routerAccount.post("/register", createAccount);
routerAccount.post("/verifyUser", getTokenData, verifyUser);


export default routerAccount;
