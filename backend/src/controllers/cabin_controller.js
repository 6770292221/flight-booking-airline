import { CabinClassMongooseModel } from "../models/cabin_models.js";
import { StatusCodes, StatusMessages, Codes, Messages } from "../enums/enums.js";

export async function getCabinClasses(req, res) {
    try {
        const { page = 1, limit = 10 } = req.query;

        const cabinClasses = await CabinClassMongooseModel.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ updatedAt: -1 });

        const total = await CabinClassMongooseModel.countDocuments();

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.CABIN_1004,
            message: Messages.CABIN_1004,
            data: {
                items: cabinClasses,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            code: Codes.GNR_1001,
            message: Messages.GNR_1001,

        });
    }
}

export async function getCabinClassById(req, res) {
    try {
        const { id } = req.params;

        const cabinClass = await CabinClassMongooseModel.findById(id);

        if (!cabinClass) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.SUCCESS,
                code: Codes.CABIN_1005,
                message: Messages.CABIN_1005,

            });
        }

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.CABIN_1004,
            message: Messages.CABIN_1004,
            data: cabinClass
        });
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            code: Codes.GNR_1001,
            message: Messages.GNR_1001,

        });
    }
}

export async function createCabinClass(req, res) {
    try {
        const { code, name, checked, carryOn } = req.body;

        if (!code || !name || !checked || !carryOn) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.CABIN_1002,
                message: Messages.CABIN_1002,

            });
        }

        const existingCabin = await CabinClassMongooseModel.findOne({ code });
        if (existingCabin) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.CABIN_1003,
                message: Messages.CABIN_1003,
            });
        }

        const newCabinClass = new CabinClassMongooseModel({
            code,
            name,
            checked,
            carryOn
        });

        const validationError = newCabinClass.validateSync();
        if (validationError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                code: Codes.VAL_4004,
                message: Messages.VAL_4004,
            });
        }

        await newCabinClass.save();

        return res.status(StatusCodes.CREATE).json({
            status: StatusMessages.SUCCESS,
            code: Codes.CABIN_1001,
            message: Messages.CABIN_1001,
            data: newCabinClass
        });
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function updateCabinClass(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedCabinClass = await CabinClassMongooseModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCabinClass) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.CABIN_1005,
                message: Messages.CABIN_1005,
            });
        }

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.CABIN_1006,
            message: Messages.CABIN_1006,
            data: updatedCabinClass
        });
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function deleteCabinClass(req, res) {
    try {
        const { id } = req.params;

        const deletedCabinClass = await CabinClassMongooseModel.findByIdAndDelete(id);

        if (!deletedCabinClass) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.CABIN_1005,
                message: Messages.CABIN_1005,

            });
        }

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.CABIN_1007,
            message: Messages.CABIN_1007,
            data: deletedCabinClass
        });

    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}
