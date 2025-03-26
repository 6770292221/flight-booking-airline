import { BookingMongooseModel } from "../models/booking_models.js";
import { StatusCodes, StatusMessages, Codes, Messages } from "../enums/enums.js";
import { AccountMongooseModel } from '../models/account_models.js';
import { sendETicketsIssuedEmail, sendETicketsFailedTemplate, sendRefundsTemplate } from '../email/emailService.js';
import { PaymentMongooseModel } from "../models/payment_models.js";


export async function webhookUpdateTickets(req, res) {
    try {
        const bookingId = req.params._id;
        const { passengers, ticketStatus, reason } = req.body;


        const booking = await BookingMongooseModel.findById(bookingId);

        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.RSV_3011,
                message: Messages.RSV_3011,
            });
        }

        if (ticketStatus === "SUCCESS") {
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

            const payment = await PaymentMongooseModel.findOne({ bookingId: booking._id });
            if (payment && payment.paymentStatus !== "REFUNDED") {
                const refundTxnId = `RFND${Date.now()}`;

                payment.paymentStatus = "REFUNDED";
                payment.refund = payment.refund || {};
                payment.refund.isRefunded = true;
                payment.refund.refundedAt = new Date();
                payment.refund.refundStatus = "SUCCESS";
                payment.refund.refundAmount = payment.amount;
                payment.refund.refundTransactionId = refundTxnId;

                payment.events = payment.events || [];
                payment.events.push({
                    type: "REFUND_ISSUED",
                    status: "SUCCESS",
                    source: "SYSTEM",
                    message: "Refund processed due to ticket issuance failure.",
                    payload: { bookingId, reason }
                });

                await payment.save();
            }



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

                await sendRefundsTemplate({
                    bookingResponse: booking.toObject(),
                    reqUser: user,
                    refundTxnId: payment.paymentRef,
                    refundAmount: payment.refund.refundAmount,
                    reason: reason || "Ticket issuance failed."
                });
            }

            return res.status(StatusCodes.OK).json({
                status: StatusMessages.FAILED,
                code: Codes.RSV_3016,
                message: reason || "Ticket issuance failed.",
                data: booking,
            });
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.RSV_3017,
                message: "Invalid ticketStatus value.",
            });
        }

    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
        });
    }
}
