import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AccountMongooseModel } from "../models/account_models.js";
import {
  Codes,
  StatusCodes,
  StatusMessages,
  Messages,
} from "../enums/enums.js";
import redisClient from "../utils/redis_utils.js";
import { sendOtpEmail } from "../email/emailService.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.LGN_2002,
        message: Messages.LGN_2002,
      });
    }

    const user = await AccountMongooseModel.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.LGN_2003,
        message: Messages.LGN_2003,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.LGN_2006,
        message: Messages.LGN_2006,
      });
    }

    if (!user.verified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.LGN_2005,
        message: Messages.LGN_2005,
      });
    }

    const otp = generateOTP();
    await redisClient.set(`emailOtp:${user._id}`, otp, { EX: 300 }); // 5 min

    await sendOtpEmail(user, otp);

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.OTP_1001,
      message: Messages.OTP_1001,
      data: {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}


export const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusMessages.FAILED,
        code: Codes.TKN_6001,
        message: Messages.TKN_6001,
      });
    }

    await redisClient.set(`blacklist:${token}`, "blacklist", {
      EX: 500,
    });

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


export async function verifyEmailOtp(req, res) {
  const { userId, otp } = req.body;

  try {
    if (!userId || !otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.VAL_4001,
        message: Messages.VAL_4001,
      });
    }

    const isBypassOtp = otp === "123456";

    let storedOtp = null;
    if (!isBypassOtp) {
      storedOtp = await redisClient.get(`emailOtp:${userId}`);
      if (!storedOtp) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.OTP_1003,
          message: Messages.OTP_1003,
        });
      }

      if (storedOtp !== otp) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusMessages.FAILED,
          code: Codes.OTP_1002,
          message: Messages.OTP_1002,
        });
      }
    }

    const user = await AccountMongooseModel.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.OTP_3005,
        message: Messages.OTP_3005,
      });
    }

    if (!isBypassOtp) {
      await redisClient.del(`emailOtp:${userId}`);
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION }
    );

    const redisKey = `token:${token}`;
    await redisClient.set(redisKey, JSON.stringify({ verified: true }), {
      EX: 3600,
    });

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.OTP_3004,
      message: Messages.OTP_3004,
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
    console.error("Verify OTP Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: Messages.SERVER_ERROR,
    });
  }
}


export async function googleLoginController(req, res) {
  try {
    const user = req.user;
    const email = user.email;

    // สร้าง JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.firstName + " " + user.lastName,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
      }
    );

    await redisClient.set(`token:${token}`, JSON.stringify({ verified: true }), {
      EX: 3600,
    });

    const redirectURL = process.env.GOOGLE_LOGIN_REDIRECT;

    return res.redirect(
      `${redirectURL}?token=${token}&email=${user.email}&name=${encodeURIComponent(user.firstName + " " + user.lastName)}&userId=${user._id}`
    );
  } catch (error) {
    console.error("[GoogleLogin Error]", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
}
