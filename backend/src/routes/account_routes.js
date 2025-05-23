import { Router } from "express";
import { createAccount, verifyUserByEmail } from "../controllers/account_controller.js";


const routerAccount = Router();

routerAccount.post("/register", createAccount);
routerAccount.get("/verifyUser/:email", verifyUserByEmail);


export default routerAccount;
