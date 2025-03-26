import { StatusCodes, StatusMessages, Codes, Messages } from "../enums/enums.js";
import { AircraftMongooseModel } from "../models/aircraft_models.js";


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
                seatCapacity: aircraft.seatCapacity
            })),
            pagination: {
                total: aircrafts.length,
                page: 1,
                limit: aircrafts.length,
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
};

export async function getAircraftById(req, res) {
    try {
        const { id } = req.params;
        const aircraft = await AircraftMongooseModel.findById(id);

        if (!aircraft) {

            logger.info(` Aircraft with ID: ${id} not found.`, "error");
            return res.status(404).json({ error: "Aircraft not found." });
        }

        return res.status(StatusCodes.OK).json({
            id: aircraft.id,
            aircraftCode: aircraft.aircraftCode,
            name: aircraft.name,
            seatLayout: aircraft.seatLayout,
            seatPitch: aircraft.seatPitch,
            seatCapacity: aircraft.seatCapacity,

        });
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function createAircraft(req, res) {
    const { aircraftCode, name, seatLayout, seatPitch, seatCapacity } = req.body;

    try {

        const existingAircraft = await AircraftMongooseModel.findOne({ aircraftCode });

        if (existingAircraft) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                code: Codes.AIR_1008,
                message: Messages.AIR_1008,
            });
        }

        const newAircraft = await AircraftMongooseModel.create({
            aircraftCode,
            name,
            seatLayout,
            seatPitch,
            seatCapacity
        });

        return res.status(StatusCodes.CREATE).json({
            status: StatusMessages.SUCCESS,
            code: Codes.AIR_1007,
            message: Messages.AIR_1007,
            data: newAircraft
        });
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function updateAircraft(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedAircraft = await AircraftMongooseModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedAircraft) {
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
            data: updatedAircraft
        });
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function deleteAircraft(req, res) {
    const { id } = req.params;

    try {
        const deletedAircraft = await AircraftMongooseModel.findByIdAndDelete(id);

        if (!deletedAircraft) {
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
