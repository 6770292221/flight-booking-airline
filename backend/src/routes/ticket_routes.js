import { Router } from "express";
import { webhookUpdateTickets, requestTicketIssued } from '../controllers/ticket_controller.js';


const routerTicket = Router();

routerTicket.post("/webhooks/update-tickets/:_id", webhookUpdateTickets);
routerTicket.get('/ticket/:id/request-ticket-issued', requestTicketIssued);


export default routerTicket;
