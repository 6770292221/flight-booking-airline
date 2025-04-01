import { AccountMongooseModel } from "../models/account_models.js";
import { ResponseModel } from "../models/response_models.js";
import {
  Codes,
  StatusCodes,
  StatusMessages,
  Messages,
} from "../enums/enums.js";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
import { sendVerifyRegisterEmail } from "../email/emailService.js";
import logger from "../utils/logger_utils.js";
import { validateBody } from "../middleware/validate.js";


const hideEmail = (email) => {
  const [localPart, domainPart] = email.split("@");
  const hiddenLocalPart =
    localPart.slice(0, 2) + "*".repeat(localPart.length - 2);
  return `${hiddenLocalPart}@${domainPart}`;
};
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneNumberRegex = /^[0-9]{10}$/;
const nameRegex = /^[A-Za-zก-ฮะๆ-๏\s]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;

const validateField = (field, regex, errorCode, errorMessage) => {
  if (!regex.test(field)) {
    throw {
      code: errorCode,
      message: errorMessage,
    };
  }
};

const checkExistingAccount = async (
  field,
  value,
  model,
  errorCode,
  errorMessage
) => {
  const existingAccount = await model.findOne({ [field]: value });
  if (existingAccount) {
    throw {
      code: errorCode,
      message: errorMessage,
    };
  }
};

export async function createAccount(req, res) {
  try {
    const {
      firstName,
      lastName,
      password,
      email,
      phoneNumber,
      isAdmin = false,
    } = req.body;

    if (!firstName || !lastName || !password || !email || !phoneNumber) {
      logger.info(`Validation failed: Missing fields`, "error");
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.VAL_4001,
        message: Messages.VAL_4001,
      });
    }

    try {
      logger.info(`Validating account fields for email: ${email}`, "info");
      validateField(
        firstName,
        nameRegex,
        Codes.REG_1003,
        `${Messages.REG_1003}: ${firstName}`
      );
      validateField(
        lastName,
        nameRegex,
        Codes.REG_1003,
        `${Messages.REG_1003}: ${lastName}`
      );
      validateField(password, passwordRegex, Codes.REG_1006, Messages.REG_1006);
      validateField(
        phoneNumber,
        phoneNumberRegex,
        Codes.REG_1003,
        `${Messages.REG_1003}: ${phoneNumber}`
      );
      validateField(
        email,
        emailRegex,
        Codes.REG_1003,
        `${Messages.REG_1003}: ${email}`
      );
    } catch (validationError) {
      logger.info(`Validation error: ${validationError.message}`, "error");
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: validationError.code,
        message: validationError.message,
      });
    }

    try {
      await checkExistingAccount(
        "email",
        email,
        AccountMongooseModel,
        Codes.REG_1005,
        Messages.REG_1005
      );
    } catch (accountError) {
      logger.info(`Account already exists: ${email}`, "warn");
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: accountError.code,
        message: accountError.message,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hiddenEmail = hideEmail(email);

    const newAccount = new AccountMongooseModel({
      firstName,
      lastName,
      password: hashedPassword,
      email,
      phoneNumber,
      isAdmin,
      verified: false,
    });

    await newAccount.save();

    logger.info(`Account created successfully: ${email}`, "info");

    const user = await AccountMongooseModel.findOne({ email });

    if (!user) {
      logger.info(`Account creation failed: ${email}`, "error");
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusMessages.FAILED,
        code: Codes.LGN_2003,
        message: Messages.LGN_2003,
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
        verified: user.verified,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION }
    );

    await sendVerifyRegisterEmail(req.body)


    return res.status(StatusCodes.CREATE).json({
      status: StatusMessages.SUCCESS,
      code: Codes.REG_1001,
      message: Messages.REG_1001,
      data: {
        firstName: newAccount.firstName,
        lastName: newAccount.lastName,
        email: hiddenEmail,
        phoneNumber: newAccount.phoneNumber,
        password: hashedPassword,
        isAdmin: isAdmin,
        verified: newAccount.verified,
        token: token,
      },
    });
  } catch (error) {
    logger.info(`Unexpected error: ${error.message}`, "error");
    res.status(StatusCodes.SERVER_ERROR).json(
      ResponseModel.create({
        status: StatusMessages.FAILED,
        message: StatusMessages.SERVER_ERROR,
      })
    );
  }
}

export async function verifyUserByEmail(req, res) {
  try {
    const { email } = req.params;

    if (!email) {
      logger.info(`Email is missing from request`, "error");
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.VAL_4001,
        message: Messages.VAL_4001,
      });
    }

    const user = await AccountMongooseModel.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      logger.info(`Account not found for email: ${email}`, "warn");
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusMessages.FAILED,
        code: Codes.REG_1002,
        message: Messages.REG_1002,
      });
    }

    if (user.verified === true) {
      logger.info(`Account already verified: ${email}`, "warn");
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.REG_1007,
        message: Messages.REG_1007,
      });
    }

    user.verified = true;
    await user.save();

    logger.info(`Account verified successfully: ${email}`, "info");
    return res.redirect(`http://127.0.0.1:5500/frontend/src/pages/index.html`);
    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.REG_1008,
      message: Messages.REG_1008,
      data: {
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error) {
    logger.info(`Unexpected error: ${error.message}`, "error");
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}
