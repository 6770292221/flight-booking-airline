import { Router } from "express";
import { createAccount } from "../controllers/account_controller.js";

const routerAccount = Router();

routerAccount.post("/register", createAccount);

export default routerAccount;
