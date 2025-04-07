
import { StatusCodes, StatusMessages, Codes, Messages } from "../enums/enums.js";
import { AircraftMongooseModel } from "../models/aircraft_models.js";
import logger from "../utils/logger_utils.js";


export const getAircrafts = async (req, res) => {
    try {
        const aircrafts = await AircraftMongooseModel.find();
        const result = {
            items: aircrafts.map((aircraft) => ({
                id: aircraft._id,
                aircraftCode: aircraft.aircraftCode,
                name: aircraft.name,
                seatLayout: aircraft.seatLayout,
                seatPitch: aircraft.seatPitch,
                seatCapacity: aircraft.seatCapacity,
                updatedAt: aircraft.updatedAt,
                createdAt: aircraft.createdAt
            })),
            pagination: {
                total: aircrafts.length,
                page: 1,
                limit: aircrafts.length,
                totalPages: 1
            }
        };

        logger.info(Messages.CRAFT_1004)

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.CRAFT_1004,
            message: Messages.CRAFT_1004,
            data: result
        });

    } catch (error) {
        logger.error(JSON.stringify(error))
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            code: Codes.GNR_1001,
            message: StatusMessages.SERVER_ERROR,
        });
    }
};

export async function getAircraftById(req, res) {
    try {
        const { id } = req.params;
        const aircraft = await AircraftMongooseModel.findById(id);

        if (!aircraft) {

            logger.error(`Aircraft with ID: ${id} not found.`, "error");
            return res.status(404).json({
                status: StatusMessages.FAILED,
                code: Codes.CRAFT_1005,
                message: Messages.CRAFT_1005
            });
        }

        logger.info(Messages.CRAFT_1011)
        return res.status(StatusCodes.OK).json({
            id: aircraft.id,
            aircraftCode: aircraft.aircraftCode,
            name: aircraft.name,
            seatLayout: aircraft.seatLayout,
            seatPitch: aircraft.seatPitch,
            seatCapacity: aircraft.seatCapacity,

        });
    } catch (error) {
        logger.error(JSON.stringify(error))
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            code: Codes.GNR_1001,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function createAircraft(req, res) {
    const { aircraftCode, name, seatLayout, seatPitch, seatCapacity } = req.body;

    try {
        const existingAircraft = await AircraftMongooseModel.findOne({ aircraftCode });

        if (existingAircraft) {
            logger.error(Messages.CRAFT_1003)
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.CRAFT_1003,
                message: Messages.CRAFT_1003
            });
        }

        const newAircraft = await AircraftMongooseModel.create({
            aircraftCode,
            name,
            seatLayout,
            seatPitch,
            seatCapacity
        });
        logger.info(Messages.CRAFT_1007)
        return res.status(StatusCodes.CREATE).json({
            status: StatusMessages.SUCCESS,
            code: Codes.CRAFT_1007,
            message: Messages.CRAFT_1007,
            data: newAircraft
        });
    } catch (error) {
        logger.error(JSON.stringify(error))
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            code: Codes.GNR_1001,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function updateAircraft(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedAircraft = await AircraftMongooseModel.findByIdAndUpdate(id, updateData);

        if (!updatedAircraft) {
            logger.error(`Aircraft with ID: ${id} not found.`, "error");
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.CRAFT_1005,
                message: Messages.CRAFT_1005
            });
        }
        logger.info(Messages.CRAFT_1009)
        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.CRAFT_1009,
            message: Messages.CRAFT_1009,
            data: updatedAircraft
        });
    } catch (error) {
        logger.error(JSON.str(error))
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            code: Codes.GNR_1001,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function deleteAircraft(req, res) {
    const { id } = req.params;

    try {
        const deletedAircraft = await AircraftMongooseModel.findByIdAndDelete(id);

        if (!deletedAircraft) {
            logger.error(`Aircraft with ID: ${id} not found.`, "error");
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.CRAFT_1005,
                message: Messages.CRAFT_1005
            });
        }
        logger.info(Messages.CRAFT_1007)
        return res.status(200).json({
            status: StatusMessages.SUCCESS,
            code: Codes.CRAFT_1007,
            message: Messages.CRAFT_1007,
        });

    } catch (error) {
        logger.error(JSON.stringify(error))
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            code: Codes.GNR_1001,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}
