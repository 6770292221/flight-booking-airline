import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from './token_blacklist.js';
import { Codes, StatusCodes, StatusMessages, Messages } from "../enums/enums.js";

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001,
            });
        }

        const token = authHeader.split(" ")[1];

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
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
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



const verifyAdmin = async (req, res, next) => {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (req.user.isAdmin === false) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6003,
                message: Messages.TKN_6003,
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

export { verifyToken, verifyAdmin };



