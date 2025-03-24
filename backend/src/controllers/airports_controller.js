import { AirportMongooseModel } from "../models/airport_models.js";
import redisClient from '../utils/redis_utils.js';
import { StatusCodes, StatusMessages, Codes, Messages } from "../enums/enums.js";


export const getAirports = async (req, res) => {
    try {
        const cacheKey = 'airports_cache';

        // get จาก Redis ก่อน
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        const cacheData = await redisClient.get(cacheKey);

        if (cacheData) {
            return res.status(StatusCodes.OK).json({
                status: StatusMessages.SUCCESS,
                code: Codes.AIR_1004,
                message: Messages.AIR_1004,
                data: JSON.parse(cacheData)
            });
        }

        // ถ้าไม่เจอใน cache → query DB
        const airports = await AirportMongooseModel.find().sort({ updatedAt: -1 });

        const result = {
            items: airports.map((airport) => ({
                id: airport._id,
                iataCode: airport.iataCode,
                cityName: airport.cityName,
                airportName: airport.airportName,
                country: airport.country,
                timezone: airport.timezone
            })),
            pagination: {
                total: airports.length,
                page: 1,
                limit: airports.length,
                totalPages: 1
            }
        };

        // set TTL
        await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.AIR_1004,
            message: Messages.AIR_1004,
            data: result
        });

    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
};

// Get airport by ID
export async function getAirportById(req, res) {
    try {
        const { id } = req.params;
        const airport = await AirportMongooseModel.findById(id);

        if (!airport) {
            return res.status(404).json({ error: "Airport not found." });
        }

        return res.status(StatusCodes.OK).json({
            id: airport.id,
            iataCode: airport.iataCode,
            cityName: airport.cityName,
            airportName: airport.airportName,
            country: airport.country,
            timezone: airport.timezone,

        });
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

// Create new airport
export async function createAirport(req, res) {
    const { iataCode, cityName, airportName, country, timezone } = req.body;

    try {

        const existingAirport = await AirportMongooseModel.findOne({ iataCode });

        if (existingAirport) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                code: Codes.AIR_1008,
                message: Messages.AIR_1008,
            });
        }

        const newAirport = await AirportMongooseModel.create({
            iataCode,
            cityName,
            airportName,
            country,
            timezone
        });

        return res.status(StatusCodes.CREATE).json({
            status: StatusMessages.SUCCESS,
            code: Codes.AIR_1007,
            message: Messages.AIR_1007,
            data: newAirport
        });
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

// Update airport
export async function updateAirport(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedAirport = await AirportMongooseModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedAirport) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.AIR_1005,
                message: Messages.AIR_1005
            });
        }

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.AIR_1009,
            message: Messages.AIR_1009,
            data: updatedAirport
        });
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

// Delete airport
export async function deleteAirport(req, res) {
    const { id } = req.params;

    try {
        const deletedAirport = await AirportMongooseModel.findByIdAndDelete(id);

        if (!deletedAirport) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.AIR_1005,
                message: Messages.AIR_1005
            });
        }

        return res.status(200).json({
            status: StatusMessages.SUCCESS,
            code: Codes.AIR_1010,
            message: Messages.AIR_1010,
        });

    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function getLocations(req, res) {
    try {
        const airports = await AirportMongooseModel.find().sort({ updatedAt: -1 });

        if (!airports || airports.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.AIR_1005,
                message: Messages.AIR_1005
            });
        }

        const result = {
            items: airports.map((airport) => ({
                id: airport._id,
                iataCode: airport.iataCode,
                cityName: airport.cityName,
                airportName: airport.airportName,
                country: airport.country,
                timezone: airport.timezone
            })),
            pagination: {
                total: airports.length,
                page: 1,
                limit: airports.length,
                totalPages: 1
            }
        };

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.AIR_1004,
            message: Messages.AIR_1004,
            data: result
        });

    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}
