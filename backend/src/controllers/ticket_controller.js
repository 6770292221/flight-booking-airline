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
      console.log("-1-1-1-1-1-1");
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
      console.log("-2-2-2-2-2");
      booking.status = "ISSUED";

      booking.events.push({
        type: "TICKET_ISSUED",
        status: "SUCCESS",
        source: "WEBHOOK",
        message: "Tickets issued successfully.",
        payload: { passengers },
      });

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
      console.log("-3-3-3-3-3-3");
      return res.status(StatusCodes.OK).json({
        status: StatusMessages.SUCCESS,
        code: Codes.RSV_3007,
        message: Messages.RSV_3007,
        data: booking,
      });
    } else if (ticketStatus === "FAILED") {
      booking.status = "FAILED_ISSUED";

      booking.events.push({
        type: "TICKET_ISSUED",
        status: "FAILED",
        source: "WEBHOOK",
        message: reason || "Ticket issuance failed.",
        payload: { reason },
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
        console.log(payment.paymentRef);
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
    console.log("delay VZ 10 seconds");
    await _delay(20000);
  } else if (airline === "FD") {
    console.log("delay FD 20 seconds");
    await _delay(10000);
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
    const { passengers } = req.body;
    const booking = await BookingMongooseModel.findOne({ bookingNubmer: id });

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.TKT_1001,
        message: "Booking not found",
      });
    }

    if (booking.status !== "PAID" && booking.status == "TICKETING") {
      console.log(booking.status);
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.TKT_1002,
        message: Messages.TKT_1002,
      });
    }

    let results = [];
    const allRequests = booking.flights.map(async (flight) => {
      const result = await _sendTicketRequest(
        flight,
        passengers,
        booking.bookingNubmer
      );
      booking.status = "TICKETING";
      await booking.save();
      return results.push(result);
    });

    await Promise.allSettled(allRequests);
    console.log(results[0].response.data.response.ticketStatus);

    const failedResults = results.filter(
      (r) => r.response.data.response.ticketStatus === "FAILED"
    );

    if (failedResults.length > 0) {
        await axios.post(
          `http://localhost:3001/api/v1/ticket-core-api/webhooks/update-tickets/${booking._id}`,
          failedResults[0].response.data.response
        );
    } else {
      for (let i = 0; i < results.length; i++) {
        const rr = await axios.post(
          `http://localhost:3001/api/v1/ticket-core-api/webhooks/update-tickets/${booking._id}`,
          results[i].response.data.response
        );
      }
    }

    console.log("All requests finished:", results.length);

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
