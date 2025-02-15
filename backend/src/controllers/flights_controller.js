import { FlightServiceModel, FlightMongooseModel } from "../models/flights_modeles.js";
import { Codes, StatusCodes, StatusMessages, Messages } from "../enums/enums.js";

export async function createFlight(req, res) {
    try {
        const { flightNumber, origin, destination, departureTime, arrivalTime } = req.body;

        if (!flightNumber || !origin || !destination || !departureTime || !arrivalTime) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.FGT_1008,
                message: Messages.FGT_1008
            });
        }

        if (!req.user || req.user.isAdmin !== true) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001,
            });
        }

        const existingFlight = await FlightMongooseModel.findOne({ flightNumber });
        if (existingFlight) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.FGT_1008,
                message: Messages.FGT_1008,
            });
        }

        const newFlight = new FlightMongooseModel(req.body);
        await newFlight.save();

        return res.status(StatusCodes.CREATE).json({
            status: StatusMessages.SUCCESS,
            code: Codes.FGT_1009,
            message: Messages.FGT_1009,
            data: {
                flightId: newFlight._id,
                origin: newFlight.origin,
                destination: newFlight.destination,
                departureTime: newFlight.departureTime,
                arrivalTime: newFlight.arrivalTime,
                createdAt: newFlight.createdAt,
                updatedAt: newFlight.updatedAt,
            }
        });

    } catch (error) {
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function updateFlight(req, res) {
    try {
        const { flightNumber } = req.params;
        const { origin, destination, departureTime, arrivalTime } = req.body;

        const flight = await FlightMongooseModel.findOne({ flightNumber });

        if (!req.user || req.user.isAdmin !== true) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001,
            });
        }

        if (!flight) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.FGT_1001,
                message: Messages.FGT_1001,
            });
        }

        flight.origin = origin || flight.origin;
        flight.destination = destination || flight.destination;
        flight.departureTime = departureTime || flight.departureTime;
        flight.arrivalTime = arrivalTime || flight.arrivalTime;


        await flight.save();
        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.FGT_1006,
            message: Messages.FGT_1006,
            data: {
                flightId: flight._id,
                flightNumber: flight.flightNumber,
                origin: flight.origin,
                destination: flight.destination,
                departureTime: flight.departureTime,
                arrivalTime: flight.arrivalTime,
                createdAt: flight.createdAt,
                updatedAt: flight.arrivalTime
            }
        });

    } catch (error) {
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}


export async function getAllFlights(req, res) {
    try {
        const flights = await FlightServiceModel.getAllFlights();

        const data = flights.map(flight => ({
            flightId: flight._id,
            flightNumber: flight.flightNumber,
            origin: flight.origin,
            destination: flight.destination,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            seats: flight.seats.map(seat => ({
                id: seat._id,
                seatNumber: seat.seatNumber,
                seatClass: seat.seatClass,
                price: seat.price,
                status: seat.status,
                flightNumber: flight.flightNumber
            }))

        }));

        res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.FGT_1003,
            message: Messages.FGT_1003,
            data
        });
    } catch (error) {
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}



export async function deleteFlight(req, res) {
    try {
        const { flightNumber } = req.params;

        const flight = await FlightMongooseModel.findOneAndDelete({ flightNumber });

        if (!req.user || req.user.isAdmin !== true) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001,
            });
        }
        if (!flight) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.FGT_1004,
                message: Messages.FGT_1004
            });
        }

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.FGT_1005,
            message: Messages.FGT_1005
        });

    } catch (error) {
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}


