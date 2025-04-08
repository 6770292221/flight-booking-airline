import { BookingMongooseModel } from "../models/booking_models.js";
import { PaymentMongooseModel } from "../models/payment_models.js";
import { AccountMongooseModel } from "../models/account_models.js";

import {
  StatusCodes,
  StatusMessages,
  Codes,
  Messages,
} from "../enums/enums.js";
import mongoose from "mongoose";
import { sendBookingPendingPaymentEmail, sendBookingCancelledEmail } from "../email/emailService.js";
import axios from "axios";


export async function createBooking(req, res) {
  try {
    if (!isAuthenticated(req)) {
      return respondUnauthorized(res);
    }

    const bookingData = { ...req.body, userId: req.user.userId };
    const newBooking = new BookingMongooseModel(bookingData);

    const validationError = validateBooking(newBooking);
    if (validationError) {
      return respondValidationError(res);
    }

    await newBooking.save();

    const paymentRef = await initiatePayment(newBooking._id);

    await sendPendingEmail(newBooking.toObject(), req.user);

    return res.status(StatusCodes.CREATE).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3009,
      message: Messages.RSV_3009,
      data: { booking: newBooking, paymentRef },
    });
  } catch (error) {
    return respondServerError(res);
  }
}

function isAuthenticated(req) {
  return req.user && req.user.userId;
}

function respondUnauthorized(res) {
  return res.status(StatusCodes.UNAUTHORIZED).json({
    status: StatusMessages.FAILED,
    code: Codes.TKN_6001,
    message: Messages.TKN_6001,
  });
}

function respondValidationError(res) {
  return res.status(StatusCodes.BAD_REQUEST).json({
    status: StatusMessages.FAILED,
    code: Codes.VAL_4004,
    message: Messages.VAL_4004,
  });
}

function respondServerError(res) {
  return res.status(StatusCodes.SERVER_ERROR).json({
    status: StatusMessages.FAILED,
    message: StatusMessages.SERVER_ERROR,
  });
}

function validateBooking(booking) {
  return booking.validateSync();
}

async function initiatePayment(bookingId) {
  try {
    const response = await axios.post(
      `http://localhost:${process.env.PORT}/api/v1/payment-core-api/payments/initiate`,
      { bookingId: bookingId.toString() }
    );
    return response?.data?.data?.paymentRef || null;
  } catch (err) {
    console.error("Error calling /payments/initiate:", err.response?.data || err.message);
    return null;
  }
}

async function sendPendingEmail(bookingObj, reqUser) {
  await sendBookingPendingPaymentEmail({
    bookingResponse: bookingObj,
    reqUser: reqUser,
  });
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

    const bulkBookingOps = expiredBookings.map((b) => ({
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

    const bookingIds = expiredBookings.map((b) => b._id);

    const bulkPaymentOps = bookingIds.map((bookingId) => ({
      updateOne: {
        filter: { bookingId },
        update: {
          $set: {
            paymentStatus: "REJECTED",
            updatedAt: new Date(),
          },
        },
      },
    }));

    await BookingMongooseModel.bulkWrite(bulkBookingOps);
    await PaymentMongooseModel.bulkWrite(bulkPaymentOps);

    // for (const booking of expiredBookings) {
    //   const user = await AccountMongooseModel.findById(booking.userId);

    //   if (user?.email) {
    //     await sendBookingCancelledEmail({
    //       bookingResponse: booking.toObject(),
    //       reqUser: user.toObject(),
    //       reason: "Booking expired and was automatically cancelled",
    //     });
    //   } else {
    //     console.warn(`No email found for userId: ${booking.userId}`);
    //   }
    // }

    await Promise.all(
      expiredBookings.map(async (booking) => {
        const user = await AccountMongooseModel.findById(booking.userId);
        if (user?.email) {
          await sendBookingCancelledEmail({
            bookingResponse: booking.toObject(),
            reqUser: user.toObject(),
            reason: "Booking expired and was automatically cancelled",
          });
        }
      })
    );

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
    const bookingId = req.params._id;

    const booking = await BookingMongooseModel.findById(bookingId);

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

    await PaymentMongooseModel.updateOne(
      { bookingId: booking._id },
      {
        $set: {
          paymentStatus: "REJECTED",
          updatedAt: new Date(),
        },
      }
    );

    await sendBookingCancelledEmail({
      bookingResponse: booking.toObject(),
      reqUser: req.user,
      reason: "User cancelled the booking",
    });

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3015,
      message: Messages.RSV_3015,
    })

  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}
