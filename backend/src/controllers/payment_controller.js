import {
  Codes,
  StatusCodes,
  StatusMessages,
  Messages,
} from "../enums/enums.js";
// import { ReservationMongooseModel } from "../models/reservation_models.js";
// import { SeatMongooseModel } from "../models/seats_modeles.js";
import {
  paymentServiceProvider,
  bankPaymentService,
} from "../utils/payment_service_provider_utils.js";

export const createPayment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookingId = req.body.bookingId;
    if (!bookingId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.PMT_1003,
        message: Messages.PMT_1003,
      });
    }
    const reservationToUpdate = await ReservationMongooseModel.findOne({
      bookingId,
    });
    if (!reservationToUpdate) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.PMT_1004,
        message: Messages.PMT_1004,
      });
    }
    if (reservationToUpdate.userId !== userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.PMT_1005,
        message: Messages.PMT_1005,
      });
    }
    if (reservationToUpdate.status !== "pending") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.PMT_1006,
        message: Messages.PMT_1006,
      });
    }
    const { paymentMethod } = req.body;
    if (paymentMethod === "credit") {
      const { paymentToken, amount } = req.body;
      if (!paymentToken || !amount) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.PMT_1007,
          message: Messages.PMT_1007,
        });
      }
      // TODO: Check if the amount is matched with the reservation price
      try {
        const paymentIntent =
          await paymentServiceProvider.paymentIntents.create({
            amount: amount,
            currency: "thb",
            payment_method: paymentToken,
            confirmation_method: "manual",
            confirm: true,
            metadata: {
              bookingId,
            },
          });
        if (paymentIntent.status !== StatusMessages.SUCCESS) {
          return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            code: Codes.PMT_1008,
            message: Messages.PMT_1008,
          });
        }
        const updatedReservation = await updateReservationAndSeatToConfirmed(
          paymentIntent.metadata.bookingId,
        );
        if (updatedReservation.status !== StatusMessages.SUCCESS) {
          return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            code: Codes.PMT_1009,
            message: Messages.PMT_1009,
          });
        }
        return res.status(StatusCodes.CREATE).json({
          status: StatusMessages.SUCCESS,
          code: Codes.PMT_1001,
          message: Messages.PMT_1001,
          data: updatedReservation,
        });
      } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
          status: StatusMessages.FAILED,
          code: Codes.PMT_1008,
          message: Messages.PMT_1008,
        });
      }
    } else if (paymentMethod === "bank") {
      const {
        bankName,
        accountNumber,
        transactionReference,
        transferDateTime,
      } = req.body;
      if (
        !bankName ||
        !accountNumber ||
        !transactionReference ||
        !transferDateTime
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.PMT_1011,
          message: Messages.PMT_1011,
        });
      }
      const paymentIntent = await bankPaymentService.paymentIntents.create({
        bankName,
        accountNumber,
        transactionReference,
        transferDateTime,
        bookingId,
      });
      if (paymentIntent.status !== StatusMessages.SUCCESS) {
        return res.status(StatusCodes.SERVER).json({
          status: StatusMessages.FAILED,
          code: Codes.PMT_1010,
          message: Messages.PMT_1010,
        });
      }
      const updatedReservation = await updateReservationAndSeatToConfirmed(
        paymentIntent.bookingId,
      );
      if (updatedReservation.status !== StatusMessages.SUCCESS) {
        return res.status(StatusCodes.SERVER_ERROR).json({
          status: StatusMessages.FAILED,
          code: Codes.PMT_1009,
          message: Messages.PMT_1009,
        });
      }
      return res.status(StatusCodes.CREATE).json({
        status: StatusMessages.SUCCESS,
        code: Codes.PMT_1001,
        message: Messages.PMT_1001,
        data: {
          bankName,
          accountNumber,
          transactionReference,
          transferDateTime,
          updatedReservation,
        },
      });
    } else {
      return res.status(400).json({ message: "Invalid payment method" });
    }
  } catch (error) {
    res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
};

const updateReservationAndSeatToConfirmed = async (bookingId) => {
  const reservationToUpdate = await ReservationMongooseModel.findOne({
    bookingId,
  });
  if (!reservationToUpdate) {
    return {
      status: StatusMessages.FAILED,
      message: Messages.PMT_1004,
    };
  }
  try {
    const seatIds = reservationToUpdate.passenger.map(
      (passenger) => passenger.seatId,
    );
    let updatedSeats = 0;
    if (seatIds.length > 0) {
      const result = await SeatMongooseModel.updateMany(
        {
          _id: { $in: seatIds },
        },
        { $set: { status: "confirmed" } },
      );
      updatedSeats = result.modifiedCount;
    }
    const updatedReservation = await ReservationMongooseModel.updateOne(
      {
        _id: reservationToUpdate._id,
      },
      { $set: { status: "completed" } },
    );
    return {
      bookingId,
      updatedReservation,
      updatedSeats,
      status: StatusMessages.SUCCESS,
    };
  } catch (error) {
    console.log(error);
    return {
      status: StatusMessages.FAILED,
      error: error.message,
    };
  }
};
