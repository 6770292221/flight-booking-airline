import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AccountMongooseModel } from "../models/account_models.js";
import {
  Codes,
  StatusCodes,
  StatusMessages,
  Messages,
} from "../enums/enums.js";
import { addToBlacklist } from "../middleware/token_blacklist.js";
import redisClient from "../utils/redis_utils.js";
import speakeasy from "speakeasy";

export async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        status: StatusMessages.FAILED,
        code: Codes.LGN_2002,
        message: Messages.LGN_2002,
      });
    }

    const user = await AccountMongooseModel.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.LGN_2003,
        message: Messages.LGN_2003,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.LGN_2006,
        message: Messages.LGN_2006,
      });
    }

    if (user.verified === false) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.LGN_2005,
        message: Messages.LGN_2005,
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
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION }
    );

    await redisClient.set(token, JSON.stringify({ verified: false }));


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
        verified: false,
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

export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    await addToBlacklist(token);
    res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.LOT_5001,
      message: Messages.LOT_5001,
    });
  } catch (error) {
    res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
};

export const smsOtpVerify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

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
      encoding: "base32",
      token: verificationCode,
      window: 1,
    });


    if (!isValidOTP) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.ATH_4002,
        message: Messages.ATH_4002,
        verifie: false,
      });
    }

    await redisClient.set(token, JSON.stringify({ verified: false }));

    return res.status(200).json({
      status: StatusMessages.SUCCESS,
      code: Codes.LGN_2001,
      message: Messages.LGN_2001,
      data: {
        token,
        userId: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        verified: true,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
};
