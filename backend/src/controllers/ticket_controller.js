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

        console.log("ticket >>>> " + ticketStatus)
        const booking = await BookingMongooseModel.findById(bookingId);
        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.RSV_3011,
                message: Messages.RSV_3011,
            });
        }

        if (ticketStatus === "SUCCESS" && booking.status == "TICKETING") {
            if (!passengers || !Array.isArray(passengers)) {
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
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        status: StatusMessages.FAILED,
                        code: Codes.RSV_3008,
                        message: `Passenger at index ${i} with passportNumber '${updatedPassenger.passportNumber}' not found in booking.`,
                    });
                }

                if (updatedPassenger.tickets && Array.isArray(updatedPassenger.tickets)) {
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
                console.error('Validation error:', validationError);
                return res.status(StatusCodes.BAD_REQUEST).json({
                    status: StatusMessages.FAILED,
                    code: Codes.VAL_4004,
                    message: Messages.VAL_4004,
                });
            }

            await booking.save();

            const user = await AccountMongooseModel.findById(booking.userId).lean();

            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    status: StatusMessages.FAILED,
                    message: "User not found for this booking."
                });
            }

            await sendETicketsIssuedEmail({
                bookingResponse: booking.toObject(),
                reqUser: user,
            });

            return res.status(StatusCodes.OK).json({
                status: StatusMessages.SUCCESS,
                code: Codes.RSV_3007,
                message: Messages.RSV_3007,
                data: booking,
            });

        } else if (ticketStatus === "FAILED" && booking.status == "TICKETING") {

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

            const payment = await PaymentMongooseModel.findOne({ bookingId: booking._id });
  
            const user = await AccountMongooseModel.findById(booking.userId).lean();

            if (user) {

                await sendETicketsFailedTemplate({
                    bookingResponse: booking.toObject(),
                    reqUser: user,
                    refundAmount: payment.refund.refundAmount,
                    reason: reason || "Ticket issuance failed."
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
                console.log(payment.paymentRef)
                await axios.post('http://localhost:3001/api/v1/payment-core-api/payments/webhook', {
                    event: "REFUNDED_SUCCESS",
                    paymentRef: payment.paymentRef,
                    paymentStatus: "REFUNDED",
                    paymentTransactionId: '"GB1234567890"',
                    paymentProvider: payment.paymentProvider,
                    paymentMethod: payment.paymentMethod,
                    paidAt: Date.now(),
                    amount: payment.refund.refundAmount,
                    currency: payment.currency 
                })
            }

            return res.status(StatusCodes.OK).json({
                status: StatusMessages.FAILED,
                code: Codes.RSV_3016,
                message: reason || "Ticket issuance failed.",
                data: booking,
            });
        
        } else {
            console.log("finish flow ticket")
            return
            // return res.status(StatusCodes.BAD_REQUEST).json({
            //     status: StatusMessages.FAILED,
            //     code: Codes.RSV_3017,
            //     message: "Invalid ticketStatus value.",
            // });
        }

    } catch (error) {
        console.error(error)
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
        });
    }
}
