import { PaymentMongooseModel } from "../models/payment_models.js";
import { BookingMongooseModel } from "../models/booking_models.js";
import { AccountMongooseModel } from "../models/account_models.js";
import {
  StatusCodes,
  StatusMessages,
  Codes,
  Messages,
} from "../enums/enums.js";
import {
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendRefundsTemplate,
} from "../email/emailService.js";
import axios from "axios";

export async function initiatePayment(req, res) {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await BookingMongooseModel.findById(bookingId);

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "failed",
        code: "PAY_4001",
        message: "Booking not found",
      });
    }

    const totalAmount =
      booking.flights.reduce((sum, f) => sum + parseFloat(f.price.amount), 0) +
      booking.passengers.reduce((sum, p) => {
        return (
          sum +
          (p.addons || []).reduce(
            (aSum, a) => aSum + parseFloat(a.price.amount),
            0
          )
        );
      }, 0);

    const paymentRef = `TXN${Date.now()}`;

    const payment = new PaymentMongooseModel({
      bookingId: booking._id,
      paymentRef,
      paymentMethod,
      paymentStatus: "PENDING",
      amount: totalAmount,
      currency: "THB",
    });

    await payment.save();

    const redirectUrl = `https://fake-gateway.com/checkout?ref=${paymentRef}`; // Replace with real one

    return res.status(StatusCodes.CREATE).json({
      status: "success",
      code: "PAY_2001",
      message: "Payment initiated",
      data: {
        paymentRef,
        bookingId,
        amount: totalAmount,
        currency: "THB",
        paymentMethod,
        paymentStatus: "PENDING",
        redirectUrl,
      },
    });
  } catch (error) {
    console.error("Payment initiation failed:", error);
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: "failed",
      code: "PAY_5000",
      message: "Internal Server Error",
    });
  }
}

export async function webhookHandler(req, res) {
  try {
    const {
      event,
      paymentRef,
      paymentStatus,
      paymentTransactionId,
      paymentProvider,
      paymentMethod,
      paidAt,
      amount,
      currency,
    } = req.body;

    const payment = await PaymentMongooseModel.findOne({ paymentRef });
    if (!payment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.PAY_1003,
        message: Messages.PAY_1003,
        data: {},
      });
    }

    const booking = await BookingMongooseModel.findById(payment.bookingId);
    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.PAY_1004,
        message: Messages.PAY_1004,
        data: {},
      });
    }

    const user = await AccountMongooseModel.findById(booking.userId);
    if (!user || !user.email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.PAY_1005,
        message: Messages.PAY_1005,
        data: {},
      });
    }

    if (
      event === "SUCCESS_PAID" &&
      !["FAILED", "PENDING"].includes(payment.paymentStatus)
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.PAY_1010,
        message: Messages.PAY_1010,
        data: {},
      });
    }

    if (
      event === "FAILED_PAID" &&
      !["PENDING", "FAILED"].includes(payment.paymentStatus)
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.PAY_1011,
        message: Messages.PAY_1011,
        data: {},
      });
    }

    if (event === "REFUNDED_SUCCESS" && payment.paymentStatus !== "SUCCESS") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.PAY_1012,
        message: Messages.PAY_1012,
        data: {},
      });
    }

    if (amount !== payment.amount) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.PAY_1013,
        message: Messages.PAY_1013,
        data: {},
      });
    }

    let paymentStatusUpdate;
    let bookingStatusUpdate;

    if (event === "SUCCESS_PAID") {
      paymentStatusUpdate = "SUCCESS";
      bookingStatusUpdate = "PAID";
      await sendPaymentSuccessEmail({
        bookingResponse: booking.toObject(),
        reqUser: user.toObject(),
        payment: payment,
      });
    } else if (event === "FAILED_PAID") {
      paymentStatusUpdate = "FAILED";
      bookingStatusUpdate = "FAILED_PAID";
      await sendPaymentFailedEmail({
        bookingResponse: booking.toObject(),
        reqUser: user.toObject(),
        payment: payment,
      });
    } else if (event === "REFUNDED_SUCCESS") {
      paymentStatusUpdate = "REFUNDED";
      bookingStatusUpdate = "FAILED_ISSUE";
      await sendRefundsTemplate({
        bookingResponse: booking.toObject(),
        reqUser: user.toObject(),
        reason: "Payment refunded",
        refundTxnId: paymentTransactionId,
        refundAmount: amount,
        payment: payment,
      });
    }

    payment.paymentStatus = paymentStatusUpdate;
    payment.paymentTransactionId = paymentTransactionId;
    payment.paymentMethod = paymentMethod;
    payment.paymentProvider = paymentProvider;
    payment.paidAt = paidAt;
    payment.amount = amount;
    payment.currency = currency;

    payment.updatedAt = new Date();

    payment.events.push({
      payload: req.body,
    });

    booking.status = bookingStatusUpdate;
    booking.updatedAt = new Date();

    await payment.save();
    await booking.save();

    res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.PAY_1006,
      message: Messages.PAY_1006,
      data: {},
    });

    if (event === "SUCCESS_PAID") {
      axios.get(
        `http://localhost:${process.env.PORT}/api/v1/ticket-core-api/ticket/${booking.bookingNubmer}/request-ticket-issued`
      );
    }
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: "failed",
      code: "PAY_5000",
      message: "Internal Server Error",
    });
  }
}

export async function getPaymentById(req, res) {
  try {
    const { id } = req.params;
    const user = req.user
    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.PMT_1012, 
        message: Messages.PMT_1012,
      });
    }
    const payment = await PaymentMongooseModel.findById(id);
    if (!payment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.PMT_1012, 
        message: Messages.PMT_1012,
      });
    }
    const booking = await BookingMongooseModel.findById(payment.bookingId);
    if (!booking) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusMessages.FAILED,
        code: Codes.PAY_1003,
        message: Messages.PAY_1003,
      });
    }

    const userIsNotOwnerOfThePayment = booking.userId.toString() !== user.userId

    if (userIsNotOwnerOfThePayment) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusMessages.FAILED,
        code: Codes.PMT_1016,
        message: Messages.PMT_1016,
      });
    }
    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.PMT_1013, 
      message: Messages.PMT_1013,
      data: payment,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: StatusCodes.SERVER_ERROR, 
      message: Messages.GNR_1001,
    });
  }
}

export async function getAllPayments(req, res) {
  const user = req.user
  if (!user.isAdmin) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusMessages.FAILED,
      code: Codes.TKN_6003,
      message: Messages.TKN_6003,
    })
  }
  try {
    const payments = await PaymentMongooseModel.find({})
    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.PMT_1013, 
      message: Messages.PMT_1013,
      data: payments,
      meta: {
        itemCount: payments.length,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: StatusCodes.SERVER_ERROR,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}