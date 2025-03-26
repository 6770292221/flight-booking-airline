import { PaymentMongooseModel } from "../models/payment_models.js";
import { BookingMongooseModel } from "../models/booking_models.js";
import { StatusCodes } from "../enums/enums.js";

export async function initiatePayment(req, res) {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await BookingMongooseModel.findOne({ bookingId });

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "failed",
        code: "PAY_4001",
        message: "Booking not found"
      });
    }

    const totalAmount = booking.flights.reduce((sum, f) => sum + parseFloat(f.price.amount), 0) +
      booking.passengers.reduce((sum, p) => {
        return sum + (p.addons || []).reduce((aSum, a) => aSum + parseFloat(a.price.amount), 0);
      }, 0);

    const paymentRef = `TXN${Date.now()}`;

    const payment = new PaymentMongooseModel({
      bookingId: booking._id,
      paymentRef,
      paymentMethod,
      paymentStatus: "PENDING",
      amount: totalAmount,
      currency: "THB"
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
        redirectUrl
      }
    });

  } catch (error) {
    console.error("Payment initiation failed:", error);
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: "failed",
      code: "PAY_5000",
      message: "Internal Server Error"
    });
  }
}
