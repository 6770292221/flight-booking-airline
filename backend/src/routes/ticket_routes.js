import { Router } from "express";
import { webhookUpdateTickets } from '../controllers/ticket_controller.js';


const routerTicket = Router();

routerTicket.post("/webhooks/update-tickets/:_id", webhookUpdateTickets);


export default routerTicket;
