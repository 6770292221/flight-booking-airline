import { SeatMongooseModel } from "../models/seats_modeles.js";
import { FlightMongooseModel } from "../models/flights_modeles.js";
import { Codes, StatusCodes, StatusMessages, Messages } from "../enums/enums.js";

export async function createSeat(req, res) {
    try {
        const { flightNumber, seatNumber, seatClass, price } = req.body;

        if (!flightNumber || !seatNumber || !seatClass || price === undefined) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.SAT_1001,
                message: Messages.SAT_1001
            });
        }

        if (!req.user || req.user.isAdmin !== true) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001,
            });
        }

        const flight = await FlightMongooseModel.findOne({ flightNumber });
        if (!flight) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.SAT_1002,
                message: Messages.SAT_1002
            });
        }
        const existingSeat = await SeatMongooseModel.findOne({ flightId: flight._id, seatNumber });

        if (existingSeat) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.SAT_1003,
                message: Messages.SAT_1003
            });
        }

        console.log(flight)

        const flightId = flight._id;
        const newSeat = new SeatMongooseModel({
            flightId,
            seatNumber,
            seatClass,
            price,
        });

        await newSeat.save();
        console.log(newSeat);

        res.status(StatusCodes.CREATE).json({
            status: StatusMessages.SUCCESS,
            code: Messages.SAT_1004,
            message: Messages.SAT_1004,
            data: {
                flightId: flight._id,
                flightNumber: flight.flightNumber,
                origin: flight.origin,
                destination: flight.destination,
                departureTime: flight.departureTime,
                arrivalTime: flight.arrivalTime,
                seat: {
                    id: newSeat._id,
                    seatNumber: newSeat.seatNumber,
                    seatClass: newSeat.seatClass,
                    price: newSeat.price,
                    status: newSeat.status,
                    flightNumber: flightNumber
                }
            }
        });

    } catch (error) {
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function updateSeat(req, res) {
    try {
        const { _id } = req.params;
        const { seatClass, price, status } = req.body;

        if (!req.user || req.user.isAdmin !== true) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001,
            });
        }

        if (seatClass === undefined && price === undefined && status === undefined) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.SAT_1006,
                message: Messages.SAT_1006
            });
        }

        const seat = await SeatMongooseModel.findById(_id);
        if (!seat) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.SAT_1005,
                message: Messages.SAT_1005
            });
        }

        if (req.body.seatNumber || req.body.flightId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.SAT_1006,
                message: Messages.SAT_1006
            });
        }

        if (status && !["available", "reserve", "confirmed"].includes(status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.SAT_1010,
                message: Messages.SAT_1010
            });
        }

        if (seatClass !== undefined) seat.seatClass = seatClass;
        if (price !== undefined) seat.price = price;
        if (status !== undefined) seat.status = status;

        await seat.save();

        res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.SAT_1007,
            message: Messages.SAT_1007,
            data: {
                id: seat._id,
                seatNumber: seat.seatNumber,
                seatClass: seat.seatClass,
                price: seat.price,
                status: seat.status,
            }
        });

    } catch (error) {
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}


export async function deleteSeat(req, res) {
    try {
        const { _id } = req.params;

        const seat = await SeatMongooseModel.findByIdAndDelete(_id);

        if (!req.user || req.user.isAdmin !== true) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001,
            });
        }

        if (!seat) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.SAT_1005,
                message: Messages.SAT_1005,
            });
        }

        res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.SAT_1008,
            message: Messages.SAT_1008,
            data: seat
        });

    } catch (error) {
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function getAllSeats(req, res) {
    try {
        const { flightNumber } = req.query;

        let filter = {};

        if (flightNumber) {
            const flight = await FlightMongooseModel.findOne({ flightNumber });
            if (flight) {
                filter.flightId = flight._id;
            } else {
                return res.status(StatusCodes.NOT_FOUND).json({
                    status: StatusMessages.FAILED,
                    code: Codes.FGT_1001,
                    message: Messages.FGT_1001,
                });
            }
        }

        const seats = await SeatMongooseModel.find(filter);

        if (!seats.length) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.FGT_1002,
                message: `${Messages.FGT_1002} '${flightNumber}'`
            });
        }

        const seatData = seats.map(seat => ({
            seatId: seat._id.toString(),
            seatNumber: seat.seatNumber,
            seatClass: seat.seatClass,
            status: seat.status,
            price: seat.price,
            flightId: seat.flightId.toString(),
        }));

        res.status(200).json({
            status: StatusMessages.SUCCESS,
            code: Codes.SAT_1009,
            message: Messages.SAT_1009,
            data: seatData
        });
    } catch (error) {
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}


export async function getSeatById(req, res) {
    try {
        const { _id } = req.params;

        const seat = await SeatMongooseModel.findById(_id);

        if (!seat) {
            res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.FGT_1002,
                message: `${Messages.FGT_1002} '${flightNumber}'`
            });
        }

        const seatData = {
            id: seat._id.toString(),
            seatNumber: seat.seatNumber,
            seatClass: seat.seatClass,
            status: seat.status,
            price: seat.price,
            flightId: seat.flightId.toString(),

        };

        res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.SAT_1009,
            message: Messages.SAT_1009,
            data: seatData
        });
    } catch (error) {
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}
