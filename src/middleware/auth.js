import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from './token_blacklist.js';
import { Enums, Codes, StatusCodes, StatusMessages, Messages } from "../enums/enums.js";
import logger from '../utils/logger_utils.js';

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            status: StatusMessages.FAILED,
            code: Codes.TKN_6001,
            message: Messages.TKN_6001,
        });
    }

    try {
        const isBlacklisted = await isTokenBlacklisted(token);
        if (isBlacklisted) {
             return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6002,
                message: Messages.TKN_6002,
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
         return res.status(StatusCodes.UNAUTHORIZED).json({
            status: StatusMessages.FAILED,
            code: Codes.TKN_6002,
            message: Messages.TKN_6002,
        });
    }
};

export { verifyToken };
