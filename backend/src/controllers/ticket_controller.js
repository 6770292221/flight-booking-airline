import { BookingMongooseModel } from "../models/booking_models.js";
import { StatusCodes, StatusMessages, Codes, Messages } from "../enums/enums.js";
import { AccountMongooseModel } from '../models/account_models.js';
import { sendETicketsIssuedEmail, sendETicketsFailedTemplate, sendRefundsTemplate } from '../email/emailService.js';
import { PaymentMongooseModel } from "../models/payment_models.js";
import axios from "axios";

export async function webhookUpdateTickets(req, res) {
    try {
      const bookingId = req.params._id;
      const { passengers, ticketStatus, reason } = req.body;
  
      console.log("🎟️ Ticket status received:", ticketStatus);
  
      const booking = await BookingMongooseModel.findById(bookingId);
      if (!booking) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusMessages.FAILED,
          code: Codes.RSV_3011,
          message: Messages.RSV_3011,
        });
      }
  
      const user = await AccountMongooseModel.findById(booking.userId).lean();
  
      if (ticketStatus === "SUCCESS" && booking.status === "TICKETING") {
        if (!Array.isArray(passengers)) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusMessages.FAILED,
            code: Codes.RSV_3014,
            message: Messages.RSV_3014,
          });
        }
  
        // Update passenger tickets
        for (const updatedPassenger of passengers) {
          const existingPassenger = booking.passengers.find(
            (p) => p.passportNumber === updatedPassenger.passportNumber
          );
  
          if (!existingPassenger) {
            return res.status(StatusCodes.BAD_REQUEST).json({
              status: StatusMessages.FAILED,
              code: Codes.RSV_3008,
              message: `Passenger with passportNumber '${updatedPassenger.passportNumber}' not found.`,
            });
          }
  
          for (const newTicket of updatedPassenger.tickets || []) {
            const alreadyExists = existingPassenger.tickets.some(
              (t) =>
                t.flightNumber === newTicket.flightNumber &&
                t.ticketNumber === newTicket.ticketNumber
            );
  
            if (!alreadyExists) {
              existingPassenger.tickets.push(newTicket);
            }
          }
        }
  
        booking.status = "ISSUED";
        booking.updatedAt = new Date();
        booking.events.push({
          type: "TICKET_ISSUED",
          status: "SUCCESS",
          source: "WEBHOOK",
          message: "Tickets issued successfully.",
          payload: { passengers },
        });
  
        const validationError = booking.validateSync();
        if (validationError) {
          console.error("❌ Booking validation error:", validationError);
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusMessages.FAILED,
            code: Codes.VAL_4004,
            message: Messages.VAL_4004,
          });
        }
  
        await booking.save();
  
        if (user) {
          await sendETicketsIssuedEmail({
            bookingResponse: booking.toObject(),
            reqUser: user,
          });
        }
  
        return res.status(StatusCodes.OK).json({
          status: StatusMessages.SUCCESS,
          code: Codes.RSV_3007,
          message: Messages.RSV_3007,
          data: booking,
        });
      }
  
      if (ticketStatus === "FAILED" && booking.status === "TICKETING") {
        booking.status = "FAILED_ISSUED";
        booking.updatedAt = new Date();
        booking.events.push({
          type: "TICKET_ISSUED",
          status: "FAILED",
          source: "WEBHOOK",
          message: reason || "Ticket issuance failed.",
          payload: { reason },
        });
  
        await booking.save();
  
        const payment = await PaymentMongooseModel.findOne({ bookingId: booking._id });
  
        if (user && payment) {
          const refundAmount = payment?.refund?.refundAmount;
  
          await sendETicketsFailedTemplate({
            bookingResponse: booking.toObject(),
            reqUser: user,
            refundAmount,
            reason: reason || "Ticket issuance failed.",
          });
  
          await axios.post("http://localhost:3001/api/v1/payment-core-api/payments/webhook", {
            event: "REFUNDED_SUCCESS",
            paymentRef: payment.paymentRef,
            paymentStatus: "REFUNDED",
            paymentTransactionId: "GB1234567890",
            paymentProvider: payment.paymentProvider,
            paymentMethod: payment.paymentMethod,
            paidAt: Date.now(),
            amount: refundAmount,
            currency: payment.currency,
          });
        }
  
        return res.status(StatusCodes.OK).json({
          status: StatusMessages.FAILED,
          code: Codes.RSV_3016,
          message: reason || "Ticket issuance failed.",
          data: booking,
        });
      }
  
      console.log("🟡 No matching status flow. Finishing.");
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3017,
        message: "Invalid or out-of-order ticketStatus value.",
      });
    } catch (error) {
      console.error("🔥 webhookUpdateTickets error:", error.message);
      return res.status(StatusCodes.SERVER_ERROR).json({
        status: StatusMessages.FAILED,
        code: Codes.GNR_1001,
        message: StatusMessages.SERVER_ERROR,
      });
    }
  }
  