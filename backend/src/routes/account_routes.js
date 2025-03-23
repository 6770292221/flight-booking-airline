import { Router } from "express";
import { createAccount, verifyUserByEmail } from "../controllers/account_controller.js";
import { getTokenData } from "../middleware/auth.js";


const routerAccount = Router();

routerAccount.post("/register", createAccount);
routerAccount.post("/verifyUser", verifyUserByEmail);


export default routerAccount;
