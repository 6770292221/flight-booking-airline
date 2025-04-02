import { BookingMongooseModel } from "../models/booking_models.js";
import {
  StatusCodes,
  StatusMessages,
  Codes,
  Messages,
} from "../enums/enums.js";
import mongoose from "mongoose";
import {
  sendBookingPendingPaymentEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
} from "../email/emailService.js";
import { AccountMongooseModel } from "../models/account_models.js";
import axios from "axios";
import { issueTicketing } from "./airlines_controller.js";

export async function createBooking(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    const userId = req.user.userId;
    const bookingData = req.body;
    bookingData.userId = userId;
    const newBooking = new BookingMongooseModel(bookingData);

    const validationError = newBooking.validateSync();
    if (validationError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.VAL_4004,
        message: Messages.VAL_4004,
      });
    }

    await newBooking.save();

    try {
      await axios.post(
        `http://localhost:${process.env.PORT}/api/v1/payment-core-api/payments/initiate`,
        {
          bookingId: newBooking._id.toString(),
        }
      );
    } catch (err) {
      console.error(
        "Error calling /payments/initiate:",
        err.response?.data || err.message
      );
    }

    await sendBookingPendingPaymentEmail({
      bookingResponse: newBooking.toObject(),
      reqUser: req.user,
    });

    return res.status(StatusCodes.CREATE).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3009,
      message: Messages.RSV_3009,
      data: newBooking,
    });
  } catch (error) {
    console.error("Error in createBooking:", error);
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function getBookingById(req, res) {
  try {
    const { _id } = req.params;

    if (!req.user || !req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    const booking = await BookingMongooseModel.findById(_id);

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3011,
        message: Messages.RSV_3011,
      });
    }

    const isOwner = booking.userId.toString() === req.user.userId.toString();

    if (!isOwner) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    // Calculate total from flights
    let flightTotal = 0;
    if (booking.flights && booking.flights.length > 0) {
      flightTotal = booking.flights.reduce((acc, flight) => {
        const rate = parseFloat(flight.price?.amount || 0);
        return acc + rate;
      }, 0);
    }

    // Calculate total from passengers' addons
    let addonsTotal = 0;
    if (booking.passengers && booking.passengers.length > 0) {
      addonsTotal = booking.passengers.reduce((passengerAcc, passenger) => {
        const passengerAddonsTotal = passenger.addons?.reduce(
          (addonAcc, addon) => {
            const rate = parseFloat(addon.price?.amount || 0);
            return addonAcc + rate;
          },
          0
        );
        return passengerAcc + passengerAddonsTotal;
      }, 0);
    }

    const totalPrice = flightTotal + addonsTotal;

    res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3010,
      message: Messages.RSV_3010,
      data: booking,
      totalPrice: totalPrice,
      currency: "THB",
    });
  } catch (error) {
    res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function deleteBooking(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      console.log("Unauthorized access. req.user is missing:", req.user);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    const userId = req.user.userId;
    const bookingNubmer = req.params._id;

    console.log("userId:", userId);
    console.log("bookingNubmer:", bookingNubmer);

    const booking = await BookingMongooseModel.findById(bookingNubmer);

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3011,
        message: Messages.RSV_3011,
      });
    }

    const isOwner = booking.userId.toString() === userId.toString();
    const isAdmin = req.user.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    await booking.deleteOne();

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3012,
      message: Messages.RSV_3012,
      data: {
        deletedId: bookingNubmer,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function updateBooking(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    const userId = req.user.userId;
    const bookingNubmer = req.params._id;
    const updateData = req.body;

    const booking = await BookingMongooseModel.findById(bookingNubmer);

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3011,
        message: Messages.RSV_3011,
      });
    }

    const isOwner = booking.userId.toString() === userId.toString();
    const isAdmin = req.user.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    const allowedFields = [
      "flights",
      "passengers",
      "payments",
      "status",
      "amount",
      "currency",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        booking[field] = updateData[field];
      }
    });

    booking.updatedAt = new Date();

    const validationError = booking.validateSync();
    if (validationError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.VAL_4004,
        message: Messages.VAL_4004,
      });
    }

    await booking.save();

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3013,
      message: Messages.RSV_3013,
      data: booking,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function updatePayments(req, res) {
  try {
    const bookingNubmer = req.params._id;

    const { payments, status } = req.body;

    if (!payments || !Array.isArray(payments)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3006,
        message: Messages.RSV_3006,
      });
    }

    const booking = await BookingMongooseModel.findById(bookingNubmer);

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3011,
        message: Messages.RSV_3011,
      });
    }

    booking.payments = payments;

    if (status) {
      booking.status = status;
    }

    booking.updatedAt = new Date();

    const user = await AccountMongooseModel.findById(booking.userId).lean();

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        message: "User not found for this booking.",
      });
    }

    if (status === "CONFIRM") {
      await sendPaymentSuccessEmail({
        bookingResponse: booking.toObject(),
        reqUser: user,
      });
    }

    if (status === "REJECTED") {
      await sendPaymentFailedEmail({
        bookingResponse: booking.toObject(),
        reqUser: user,
      });
    }

    const validationError = booking.validateSync();
    if (validationError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.VAL_4004,
        message: Messages.VAL_4004,
      });
    }

    await booking.save();

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3005,
      message: Messages.RSV_3005,
      data: booking,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function getMyBookings(req, res) {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);

    if (!isValidObjectId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.VAL_4004,
        message: Messages.VAL_4004,
      });
    }

    const objectIdUser = new mongoose.Types.ObjectId(userId);

    let bookings = [];
    try {
      bookings = await BookingMongooseModel.find({ userId: objectIdUser })
        .sort({ createdAt: -1 })
        .lean();
    } catch (queryError) {
      return res.status(StatusCodes.SERVER_ERROR).json({
        status: StatusMessages.FAILED,
        message: StatusMessages.SERVER_ERROR,
      });
    }

    if (!bookings || bookings.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3011,
        message: Messages.RSV_3011,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3010,
      message: Messages.RSV_3010,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function getAllBookingsByAdmin(req, res) {
  try {
    let bookings = [];
    try {
      bookings = await BookingMongooseModel.find({})
        .sort({ createdAt: -1 })
        .lean();
    } catch (queryError) {
      return res.status(StatusCodes.SERVER_ERROR).json({
        status: StatusMessages.FAILED,
        message: StatusMessages.SERVER_ERROR,
      });
    }

    if (!bookings || bookings.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3011,
        message: Messages.RSV_3011,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3010,
      message: Messages.RSV_3010,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function cancelExpiredBookings(req, res) {
  try {
    const now = new Date();

    const expiredBookings = await BookingMongooseModel.find({
      status: "PENDING",
      expiresAt: { $lt: now },
    });

    if (expiredBookings.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: StatusMessages.SUCCESS,
        code: Codes.RSV_3004,
        message: Messages.RSV_3004,
        cancelledCount: 0,
      });
    }

    const bulkOps = expiredBookings.map((b) => ({
      updateOne: {
        filter: { _id: b._id },
        update: {
          $set: {
            status: "CANCELLED",
            updatedAt: new Date(),
          },
        },
      },
    }));

    await BookingMongooseModel.bulkWrite(bulkOps);

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3003,
      message: Messages.RSV_3003,
      cancelledCount: expiredBookings.length,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function cancelMyBooking(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    const userId = req.user.userId;
    const bookingNubmer = req.params._id;

    const booking = await BookingMongooseModel.findById(bookingNubmer);

    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3011,
        message: Messages.RSV_3011,
      });
    }

    const isOwner = booking.userId.toString() === userId.toString();

    if (!isOwner) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    if (booking.status !== "PENDING") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3002,
        message: Messages.RSV_3002,
      });
    }

    booking.status = "CANCELLED";
    booking.updatedAt = new Date();

    await booking.save();

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3015,
      message: Messages.RSV_3015,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}
function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function _sendTicketRequest(flight, passengers, bookingNubmer) {
  const { airline } = flight;
  console.log(`❤️ bookingNubmer started: ${bookingNubmer}`)
  if (airline === "VZ") {
    console.log('delay VZ 10 seconds')
    await _delay(10000);
  } else if (airline === "FD") {
    console.log('delay FD 20 seconds')
    await _delay(20000);
  } else if (airline === "SL") {
    console.log('delay SK 30 seconds')
    await _delay(30000);
  }else if (airline === "TG") {
    console.log('delay TG 40 seconds')
    await _delay(40000);
  }

  const response = await axios.post(
    "http://localhost:3001/api/v1/airline-core-api/airlines/ticketing",
    {
      airlineId: airline,
      passengers: passengers,
      flight: flight,
      bookingNubmer: bookingNubmer
    }
  );
  console.log(`❤️ airline finished: ${airline}`)

  return {
    airline,
    flight,
    response
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

    if (booking.status !== "PAID") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.TKT_1002,
        message: Messages.TKT_1002,
      });
    }

    const allRequests = booking.flights.map(async (flight) =>  {
      const result = await _sendTicketRequest(flight, passengers, booking.bookingNubmer)
      return result
    }
    );

    let firstFinished;
    try {
      firstFinished = await Promise.any(allRequests);
    } catch (err) {
      console.error("❌ All requests failed:", err);
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.TKT_1006,
        message: "All airline ticketing requests failed."
      });
    }
    const isSuccess = firstFinished.response.status === 200;
    booking.status = "TICKETING"
    await booking.save()
    console.log(`status >>>> ${booking.status}`)

    booking.events.push({
      type: "TICKETING",
      status: isSuccess ? "PENDING" : "FAILED",
      source: "SYSTEM",
      message: isSuccess ? "Ticketing Requested" : "Ticketing Failed",
      payload: {
        flightNumber: firstFinished.flight.flightNumber,
        direction: firstFinished.flight.direction,
        message: JSON.stringify(firstFinished.response.data)
      },
    });

    if (!isSuccess) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.TKT_1004,
        message: Messages.TKT_1004,
      });
    }

    await Promise.allSettled(allRequests).then(results => {
      console.log("All requests finished:", results.length);
    });


    console.log('return response to user')
    return res.status(StatusCodes.ACCEPTED).json({
      status: StatusMessages.ACCEPTED,
      code: Codes.TKT_1003,
      message: Messages.TKT_1003,
      data: booking,
    });
  } catch (err) {
    console.log(err.message)
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: Codes.GNR_1001,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

