import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from './token_blacklist.js';
import { Codes, StatusCodes, StatusMessages, Messages } from "../enums/enums.js";
import redisClient from '../utils/redis_utils.js';

const verifyToken = async (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            status: StatusMessages.FAILED,
            code: Codes.TKN_6001,
            message: Messages.TKN_6001,
        });
    }

    const token = authHeader.split(' ')[1];
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

        const storedData = await redisClient.get(token);
        // console.log(storedData)

        if (!storedData) {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: StatusMessages.FAILED,
                code: Codes.ATH_6005,
                message: Messages.ATH_6005,
            });
        }

        const tokenData = JSON.parse(storedData);
        if (!tokenData.verified) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.ATH_6005,
                message: Messages.ATH_6005,
            });
        }

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6002,
                message: Messages.TKN_6002,
            });
        }

        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
};

const getTokenData = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            status: StatusMessages.FAILED,
            code: Codes.TKN_6001,
            message: Messages.TKN_6001,
        });
    }

    const token = authHeader.split(' ')[1];
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
        req.token = token;

        next();
    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
};

export { verifyToken, getTokenData };



