import { BookingMongooseModel } from "../models/booking_models.js";
import {
  StatusCodes,
  StatusMessages,
  Codes,
  Messages,
} from "../enums/enums.js";
import { AccountMongooseModel } from "../models/account_models.js";
import {
  sendETicketsIssuedEmail,
  sendETicketsFailedTemplate,
  sendRefundsTemplate,
} from "../email/emailService.js";
import { PaymentMongooseModel } from "../models/payment_models.js";
import axios from "axios";

export async function webhookUpdateTickets(req, res) {
  try {
    const bookingId = req.params._id;
    const { passengers, ticketStatus, reason } = req.body;

    console.log("ticket >>>> " + ticketStatus);
    const booking = await BookingMongooseModel.findById(bookingId);
    if (!booking) {
      // return
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3011,
        message: Messages.RSV_3011,
      });
    }

    if (ticketStatus === "SUCCESS") {

      if (!passengers || !Array.isArray(passengers)) {
        // return
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.RSV_3014,
          message: Messages.RSV_3014,
        });
      }

      for (let i = 0; i < passengers.length; i++) {
        const updatedPassenger = passengers[i];

        const existingPassenger = booking.passengers.find(
          (p) => p.passportNumber === updatedPassenger.passportNumber
        );

        if (!existingPassenger) {
          // return
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusMessages.FAILED,
            code: Codes.RSV_3008,
            message: `Passenger at index ${i} with passportNumber '${updatedPassenger.passportNumber}' not found in booking.`,
          });
        }

        if (
          updatedPassenger.tickets &&
          Array.isArray(updatedPassenger.tickets)
        ) {
          updatedPassenger.tickets.forEach((newTicket) => {
            const isDuplicate = existingPassenger.tickets.some(
              (existingTicket) =>
                existingTicket.flightNumber === newTicket.flightNumber &&
                existingTicket.ticketNumber === newTicket.ticketNumber
            );

            if (!isDuplicate) {
              existingPassenger.tickets.push(newTicket);
            }
          });
        }
      }

      // booking.status = "ISSUED";

      // booking.events.push({
      //   payload: {passengers} ,
      // });

      // passengers.forEach((p) => {
      //   booking.passengers.find((v) => {
      //     v.passportNumber === p.passportNumber;
      //     v.tickets = p.tickets;
      //   });
      // });

      booking.updatedAt = new Date();

      const validationError = booking.validateSync();
      if (validationError) {
        console.error("Validation error:", validationError);
        // return
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.VAL_4004,
          message: Messages.VAL_4004,
        });
      }

      await booking.save();

      const user = await AccountMongooseModel.findById(booking.userId).lean();

      if (!user) {
        // return
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusMessages.FAILED,
          message: "User not found for this booking.",
        });
      }

      await sendETicketsIssuedEmail({
        bookingResponse: booking.toObject(),
        reqUser: user,
      });
      // return

      return res.status(StatusCodes.OK).json({
        status: StatusMessages.SUCCESS,
        code: Codes.RSV_3007,
        message: Messages.RSV_3007,
        data: booking,
      });
    } else if (ticketStatus === "FAILED") {
      booking.status = "FAILED_ISSUED";

      booking.events.push({
        payload: { passengers },
      });

      booking.updatedAt = new Date();

      await booking.save();

      const payment = await PaymentMongooseModel.findOne({
        bookingId: booking._id,
      });
      const user = await AccountMongooseModel.findById(booking.userId).lean();

      if (user) {
        await sendETicketsFailedTemplate({
          bookingResponse: booking.toObject(),
          reqUser: user,
          refundAmount: payment.amount ?? 0,
          reason: reason || "Ticket issuance failed.",
        });
      }

      if (user) {
        // await sendRefundsTemplate({
        //     bookingResponse: booking.toObject(),
        //     reqUser: user,
        //     refundTxnId: payment.paymentRef,
        //     refundAmount: payment.refund.refundAmount,
        //     reason: reason || "Ticket issuance failed."
        // });

 
        await axios.post(
          "http://localhost:3001/api/v1/payment-core-api/payments/webhook",
          {
            event: "REFUNDED_SUCCESS",
            paymentRef: payment.paymentRef,
            paymentStatus: "REFUNDED",
            paymentTransactionId: '"GB1234567890"',
            paymentProvider: payment.paymentProvider,
            paymentMethod: payment.paymentMethod,
            paidAt: Date.now(),
            amount: payment.amount ?? 0,
            currency: payment.currency,
          }
        );
      }
      // return
      return res.status(StatusCodes.OK).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3016,
        message: reason || "Ticket issuance failed.",
        data: booking,
      });
    } else {
      console.log("finish flow ticket");
      // return
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3016,
        message: "Invalid ticketStatus value.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
    });
  }
}

function _delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function _sendTicketRequest(flight, passengers, bookingNubmer) {
  const { airline } = flight;
  console.log(`❤️ bookingNubmer started: ${bookingNubmer}`);
  if (airline === "VZ") {
    console.log("delay VZ 5 seconds");
    await _delay(5000);
  } else if (airline === "FD") {
    console.log("delay FD 5 seconds");
    await _delay(5000);
  } else if (airline === "SL") {
    console.log("delay SK 30 seconds");
    await _delay(30000);
  } else if (airline === "TG") {
    console.log("delay TG 40 seconds");
    await _delay(40000);
  }

  const response = await axios.post(
    "http://localhost:3001/api/v1/airline-core-api/airlines/ticketing",
    {
      airlineId: airline,
      passengers: passengers,
      flight: flight,
      bookingNubmer: bookingNubmer,
    }
  );
  console.log(`❤️ airline finished: ${airline}`);

  return {
    airline,
    flight,
    response,
  };
}

export async function requestTicketIssued(req, res) {
  try {
    const { id } = req.params;
    const booking = await BookingMongooseModel.findOne({ bookingNubmer: id });

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.TKT_1001,
        message: "Booking not found",
      });
    }

    if (booking.status == "ISSUED") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.TKT_1005,
        message: Messages.TKT_1005,
      });
    }

    if (booking.status !== "PAID") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.TKT_1002,
        message: Messages.TKT_1002,
      });
    }

    let results = [];

    for (let i = 0; i < booking.flights.length; i++) {
      const flight = booking.flights[i];
      const result = await _sendTicketRequest(
        flight,
        booking.passengers,
        booking.bookingNubmer
      );
      booking.status = "TICKETING";
      results.push(result.response.data);
      await booking.save();
    }

    const reArrange = mergeWebhookResults(results);
    console.log(reArrange)

      await axios.post(
        `http://localhost:3001/api/v1/ticket-core-api/webhooks/update-tickets/${booking._id}`,
        reArrange)

    // console.log("All requests finished:", results.length);

    return res.status(StatusCodes.ACCEPTED).json({
      status: StatusMessages.ACCEPTED,
      code: Codes.TKT_1003,
      message: Messages.TKT_1003,
      data: booking,
    });
  } catch (err) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: Codes.GNR_1001,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

function mergeWebhookResults(results) {
  try {
    const merged = {
      bookingId: null,
      ticketStatus: null,
      reason: null,
      passengers: [],
    };
  
    const passengerMap = new Map(); // Map by passportNumber
  
    for (const result of results) {
      const { bookingId, ticketStatus, reason, passengers } = result.response;
  
      // Set once
      if (!merged.bookingId) {
        merged.bookingId = bookingId;
        merged.reason = reason;
      }
  
      if (merged.ticketStatus != "FAILED") {
        merged.ticketStatus = ticketStatus == "FAILED" ? "FAILED" : "SUCCESS";
      }
      for (const passenger of passengers) {
        const { passportNumber, tickets } = passenger;
  
        // Ensure tickets is an array
        const normalizedTickets = Array.isArray(tickets) ? tickets : [tickets];
  
        if (!passengerMap.has(passportNumber)) {
          passengerMap.set(passportNumber, {
            passportNumber,
            tickets: [...normalizedTickets],
          });
        } else {
          // Merge tickets
          const existing = passengerMap.get(passportNumber);
          for (const ticket of normalizedTickets) {
            const isDuplicate = existing.tickets.some(
              (t) =>
                t.flightNumber === ticket.flightNumber &&
                t.ticketNumber === ticket.ticketNumber
            );
  
            if (!isDuplicate) {
              existing.tickets.push(ticket);
            }
          }
        }
      }
    }
  
    merged.passengers = Array.from(passengerMap.values());
    console.log(merged.ticketStatus);
    console.log(merged.passengers[0].tickets);
    return merged;
  }catch(err) {
    console.log(err)
  }

}
