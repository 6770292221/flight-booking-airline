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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function webhookHandler(req, res) {
  try {
    const {
      event,
      paymentRef,
      paymentTransactionId,
      refundTransactionId,
      refundedAt,
      paymentProvider,
      paymentMethod,
      cardType,
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

    if (payment.paymentStatus === "REJECTED") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.PAY_1015,
        message: Messages.PAY_1015,
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

    // Validate status transitions
    if (
      event === "SUCCESS_PAID" &&
      !["PENDING", "FAILED"].includes(payment.paymentStatus)
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

    if (paymentTransactionId) {
      const existingPayment = await PaymentMongooseModel.findOne({
        paymentTransactionId,
        _id: { $ne: payment._id },
      });

      if (existingPayment) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.PAY_1014,
          message: Messages.PAY_1014,
          data: {},
        });
      }
    }

    // REFUND FLOW 
    if (event === "REFUNDED_SUCCESS") {
      if (!paymentRef || !refundTransactionId || !amount || !refundedAt) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.VAL_4001,
          message: Messages.VAL_4001,
          data: {},
        });
      }

      payment.paymentStatus = "REFUNDED";
      payment.refund = {
        refundAmount: amount,
        refundStatus: "SUCCESS",
        refundTransactionId,
        refundedAt,
      };
      payment.updatedAt = new Date();
      payment.events.push({ payload: req.body });

      booking.updatedAt = new Date();

      await payment.save();
      await booking.save();

      res.status(StatusCodes.OK).json({
        status: StatusMessages.SUCCESS,
        code: Codes.PAY_1006,
        message: Messages.PAY_1006,
        data: {},
      });

      await sendRefundsTemplate({
        bookingResponse: booking.toObject(),
        reqUser: user.toObject(),
        reason: "Payment refunded",
        refundTxnId: refundTransactionId,
        refundAmount: amount,
        payment: payment,
      });

      return;
    }

    // SUCCESS or FAILED FLOW 
    let paymentStatusUpdate = null;
    let bookingStatusUpdate = null;

    if (event === "SUCCESS_PAID") {
      paymentStatusUpdate = "SUCCESS";
      bookingStatusUpdate = "PAID";
    } else if (event === "FAILED_PAID") {
      paymentStatusUpdate = "FAILED";
      bookingStatusUpdate = "FAILED_PAID";
    }

    payment.paymentStatus = paymentStatusUpdate;
    payment.paymentTransactionId = paymentTransactionId;
    payment.paymentMethod = paymentMethod;
    payment.paymentProvider = paymentProvider;
    payment.cardType = cardType;
    payment.paidAt = paidAt;
    payment.amount = amount;
    payment.currency = currency;
    payment.updatedAt = new Date();
    payment.events.push({ payload: req.body });

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

    // Send email + Call ticket issuance
    if (event === "SUCCESS_PAID") {
      await sendPaymentSuccessEmail({
        bookingResponse: booking.toObject(),
        reqUser: user.toObject(),
        payment: payment,
      });

      await delay(2000);
      await axios.get(
        `http://localhost:${process.env.PORT}/api/v1/ticket-core-api/ticket/${booking.bookingNubmer}/request-ticket-issued`
      );
    } else if (event === "FAILED_PAID") {
      await sendPaymentFailedEmail({
        bookingResponse: booking.toObject(),
        reqUser: user.toObject(),
        payment: payment,
      });
    }

  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: StatusCodes.SERVER_ERROR,
      message: Messages.GNR_1001,
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
  const userId = req.user.userId;

  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusMessages.FAILED,
      code: Codes.TKN_6001,
      message: Messages.TKN_6001,
    });
  }

  try {
    // ✅ ดึง booking ที่เป็นของ user นี้
    const bookings = await BookingMongooseModel.find({ userId }, "_id");

    if (!bookings.length) {
      return res.status(200).json({
        status: "success",
        code: "PMT_1013",
        message: "No bookings found for this user.",
        data: [],
        meta: { itemCount: 0 }
      });
    }

    const bookingIds = bookings.map((b) => b._id);

    // ✅ ดึง payments ที่ผูกกับ bookingId เหล่านี้
    const payments = await PaymentMongooseModel.find({
      bookingId: { $in: bookingIds }
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      code: "PMT_1013",
      message: "Successfully fetched payment history",
      data: payments,
      meta: {
        itemCount: payments.length
      }
    });
  } catch (error) {
    console.error("getAllPayments error:", error);
    return res.status(500).json({
      status: "failed",
      code: 500,
      message: "Internal Server Error"
    });
  }
}




export async function getPaymentByBookingId(req, res) {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.PMT_1012,
        message: Messages.PMT_1012,
      });
    }

    const payment = await PaymentMongooseModel.findOne({ bookingId });

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


    const userIsNotOwnerOfTheBooking = booking.userId.toString() !== req.user.userId;

    if (userIsNotOwnerOfTheBooking) {
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
      data: {
        payment,
        bookingNumber: booking.bookingNubmer,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: StatusCodes.SERVER_ERROR,
      message: Messages.GNR_1001,
    });
  }
}
