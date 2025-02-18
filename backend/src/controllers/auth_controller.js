import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AccountMongooseModel } from "../models/account_models.js";
import { Codes, StatusCodes, StatusMessages, Messages } from "../enums/enums.js";
import { addToBlacklist } from '../middleware/token_blacklist.js';
import speakeasy from 'speakeasy';
import { verify } from "crypto";


export async function loginUser(req, res) {
    const { email, password } = req.body;
    try {

        if (!email || !password) {
            return res.status(400).json({
                status: StatusMessages.FAILED,
                code: Codes.LGN_2002,
                message: Messages.LGN_2002
            });
        }

        const user = await AccountMongooseModel.findOne({ email });
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.LGN_2003,
                message: Messages.LGN_2003
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.LGN_2006,
                message: Messages.LGN_2006
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneName: user.phoneName,
                isAdmin: user.isAdmin,
                verified: user.verified

            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION }
        );

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.LGN_2001,
            message: Messages.LGN_2001,
            data: {
                token,
                userId: user._id,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(StatusMessages.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export const verifyTokenUser = (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001,
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    status: StatusMessages.FAILED,
                    code: Codes.TKN_6002,
                    message: Messages.TKN_6002,
                });
            }

            const issuedAt = new Date(decoded.iat * 1000).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
            const expiresAt = new Date(decoded.exp * 1000).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

            res.status(StatusCodes.OK).json({
                status: StatusMessages.SUCCESS,
                code: Codes.TKN_2000,
                message: Messages.TKN_2000,
                data: {
                    userId: decoded.userId,
                    email: decoded.email,
                    isAdmin: decoded.isAdmin,
                    issuedAt,
                    expiresAt,

                }

            });
        });

    } catch (error) {
        console.error("Error during token verification:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            code: Codes.SRV_5001,
            message: Messages.SRV_5001,
        });
    }
};

export const logoutUser = async (req, res) => {

    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });

    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001,
            });
        }

        await addToBlacklist(token);

        res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });

        res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.LOT_5001,
            message: Messages.LOT_5001,
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
};

export const verify2fa = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { verificationCode } = req.body;
        if (!verificationCode) {
            return res.status(StatusCodes.OK).json({
                status: StatusMessages.SUCCESS,
                code: Codes.ATH_4003,
                message: Messages.ATH_4003,
            });
        }

        const user = await AccountMongooseModel.findById(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.REG_1002,
                message: Messages.REG_1002,
            });
        }

        const twoFactorSecret = user.twoFactorSecret;
        if (!twoFactorSecret) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.LGN_2004,
                message: Messages.LGN_2004,
            });
        }

        const isValidOTP = speakeasy.totp.verify({
            secret: twoFactorSecret,
            encoding: 'base32',
            token: verificationCode,
            window: 1
        });

        if (!isValidOTP) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.ATH_4002,
                message: Messages.ATH_4002,
                verifie: false
            });
        }

        return res.status(200).json({
            verified: true,
            code: Codes.ATH_4004,
            message: Messages.ATH_4004,
            verifie: true

        });

    } catch (error) {
        console.error("Error during verify2fa:", error);
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
};
