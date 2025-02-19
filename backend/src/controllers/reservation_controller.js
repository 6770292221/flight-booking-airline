import {
  ReservationServiceModel,
  ReservationMongooseModel,
} from "../models/reservation_models.js";
import { FlightMongooseModel } from "../models/flights_modeles.js";
import { SeatMongooseModel } from "../models/seats_modeles.js";
import {
  Codes,
  StatusCodes,
  StatusMessages,
  Messages,
} from "../enums/enums.js";
import { Types } from "mongoose";

export const createReservation = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { flightId, passenger } = req.body;

    if (!passenger || !userId || !flightId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3001,
        message: Messages.RSV_3001,
      });
    }

    if (!Types.ObjectId.isValid(flightId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3002,
        message: Messages.RSV_3002,
      });
    }

    const flight = await FlightMongooseModel.findById(flightId);

    if (!flight) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3003,
        message: Messages.RSV_3003,
      });
    }

    const seatIds = passenger.map((p) => p.seatId);
    const uniqueSeatIds = new Set(seatIds);

    if (seatIds.length !== uniqueSeatIds.size) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3004,
        message: Messages.RSV_3004,
      });
    }

    const passports = passenger.map((p) => p.passport);
    const uniquePassports = new Set(passports);

    if (passports.length !== uniquePassports.size) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3005,
        message: Messages.RSV_3005,
      });
    }

    for (let i = 0; i < passenger.length; i++) {
      const { seatId, first, family, passport, price } = passenger[i];

      if (!Types.ObjectId.isValid(seatId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.RSV_3006,
          message: Messages.RSV_3006.replace("{index}", i + 1),
        });
      }

      const seat = await SeatMongooseModel.findById(seatId);
      if (!seat) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.RSV_3007,
          message: Messages.RSV_3007.replace("{index}", i + 1),
        });
      }
      if (typeof price !== "number" || price <= 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.RSV_3010,
          message: Messages.RSV_3010.replace("{index}", i + 1),
        });
      }

      if (price <= 0 || isNaN(price)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.RSV_3011,
          message: Messages.RSV_3011.replace("{index}", i + 1),
        });
      }

      if (!seatId || !first || !family || !passport || !price) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.RSV_3008,
          message: Messages.RSV_3008.replace("{index}", i + 1),
        });
      }

      if (seat.status !== "available") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.RSV_3012,
          message: Messages.RSV_3012.replace("{index}", i + 1),
        });
      }
    }

    const destination = flight.destination;
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const generatedBookingId = `${destination}-${randomDigits}`;

    const reservationService = new ReservationServiceModel();
    const reservation = await reservationService.createReservation(
      flightId,
      passenger,
      userId,
      generatedBookingId
    );

    let totalPrice = 0;
    const selectedPassengers = await Promise.all(
      reservation.passenger.map(async (p) => {
        const seat = await SeatMongooseModel.findById(p.seatId);
        //* add update status "pending"
        await SeatMongooseModel.updateOne(
          { _id: p.seatId },
          { $set: { status: "pending" } }
        );
        if (seat) {
          totalPrice += parseFloat(p.price);
        }

        return {
          seatId: p.seatId,
          seatNumber: seat.seatNumber,
          fullName: `${p.first} ${p.family}`,
          passport: p.passport,
          price: p.price,
        };
      })
    );

    res.status(StatusCodes.CREATE).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3009,
      message: Messages.RSV_3009,
      date: {
        flightId: reservation.flightId,
        flightNumber: flight.flightNumber,
        bookingId: reservation.bookingId,
        status: reservation.status,
        paymentReference: reservation.paymentReference,
        passenger: selectedPassengers,
        totalPrice: totalPrice,
      },
    });
  } catch (error) {
    res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
};

export async function getAllReservations(req, res) {
  try {
    const email = req.query.email;

    const reservations = email
      ? await ReservationServiceModel.getReservationsByEmail(email)
      : await ReservationServiceModel.getAllReservations();

    const filteredReservations = reservations.filter((reservation) => {
      return reservation.account?.email === email;
    });

    const data = reservations.map((reservation) => {
      return {
        flightNumber:
          reservation.flightNumber || reservation.flight?.flightNumber,
        origin: reservation.origin || reservation.flight?.origin,
        destination: reservation.destination || reservation.flight?.destination,
        departureTime:
          reservation.departureTime || reservation.flight?.departureTime,
        arrivalTime: reservation.arrivalTime || reservation.flight?.arrivalTime,
        reservationId: reservation._id || reservation.reservationId,
        paymentStatus: reservation.paymentStatus,
        bookingId: reservation.bookingId,
        createdAt: reservation.createdAt,
        name: reservation.account?.name,
        email: reservation.account?.email,
        seats: reservation.seats,
        totalPrice: reservation.totalPrice,
      };
    });

    res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.RSV_3009,
      message: Messages.RSV_3009,
      data,
    });

    console.log(data);
  } catch (error) {
    res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export const updateExpiredReservations = async (req, res) => {
  try {
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const currentTime = new Date();

    const expiredReservations = await ReservationMongooseModel.find({
      status: "pending",
      createdAt: { $lte: new Date(currentTime - THIRTY_MINUTES) },
    });
    console.log(`expiredReservations ${expiredReservations}`);
    if (expiredReservations.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: StatusMessages.FAILED,
        code: Codes.RSV_3013,
        message: Messages.RSV_3013,
      });
    }

    const seatIds = expiredReservations.flatMap((reservation) =>
      reservation.passenger.map((passenger) => passenger.seatId)
    );

    const updatedReservations = await ReservationMongooseModel.updateMany(
      {
        status: "pending",
        createdAt: { $lte: new Date(currentTime - THIRTY_MINUTES) },
      },
      { $set: { status: "cancelled" } }
    );

    let updatedSeats = 0;
    if (seatIds.length > 0) {
      const result = await SeatMongooseModel.updateMany(
        {
          _id: { $in: seatIds },
          status: { $ne: "available" },
        },
        { $set: { status: "available" } }
      );
      updatedSeats = result.modifiedCount;
    }

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.FAILED,
      code: Codes.RSV_3014,
      message: Messages.RSV_3014,
      updatedReservations: updatedReservations.modifiedCount,
      updatedSeats: updatedSeats,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
};
