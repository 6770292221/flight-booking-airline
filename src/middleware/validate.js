
import { Codes, Enums, Messages, StatusCodes, StatusMessages } from "../enums/enums.js";
import { bookingSchema } from "../utils/joi_validator_utils.js";
import logger from "../utils/logger_utils.js";

const validateBody = (schema) => (req, res, next) => {
    try {
        logger.info('Start validateBody')
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: StatusMessages.FAILED,
                code: Codes.VAL_4004,
                message: Messages.VAL_4004,
                data: error.details.map((err) => err.message),
            });
        }
        next();
    } catch (e) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            success: StatusMessages.SERVER_ERROR,
            code: Codes.GNR_1001,
            message: Messages.GNR_1001
        });
    }

};

const validateParam = (schema) => (req, res, next) => {
    try {
        const { error } = schema.validate(req.params , { abortEarly: false });
        if (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: StatusMessages.FAILED,
                code: Codes.VAL_4004,
                message: Messages.VAL_4004,
                data: error.details.map((err) => err.message),
            });
        }
        next();
    } catch (e) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            success: StatusMessages.SERVER_ERROR,
            code: Codes.GNR_1001,
            message: Messages.GNR_1001
        });
    }
}

export { validateBody, validateParam };