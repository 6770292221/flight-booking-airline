import { AccountServiceModel, AccountMongooseModel } from "../models/account_models.js";
import { ResponseModel } from "../models/response_models.js";
import { Codes, StatusCodes, StatusMessages, Messages } from "../enums/enums.js";
import bcrypt from 'bcrypt';

const hideEmail = (email) => {
  const [localPart, domainPart] = email.split('@');
  const hiddenLocalPart = localPart.slice(0, 2) + '*'.repeat(localPart.length - 2);
  return `${hiddenLocalPart}@${domainPart}`;
};

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneNumberRegex = /^[0-9]{10}$/;
const nameRegex = /^[A-Za-zก-ฮะๆ-๏\s]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;

const validateField = (field, regex, errorCode, errorMessage) => {
  if (!regex.test(field)) {
    throw {
      code: errorCode,
      message: errorMessage
    };
  }
};

const checkExistingAccount = async (field, value, model, errorCode, errorMessage) => {
  const existingAccount = await model.findOne({ [field]: value });
  if (existingAccount) {
    throw {
      code: errorCode,
      message: errorMessage
    };
  }
};

export async function createAccount(req, res) {
  try {
    const { firstName, lastName, password, email, phoneNumber, isAdmin = false } = req.body;

    if (!firstName || !lastName || !password || !email || !phoneNumber) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: Codes.VAL_4001,
        message: Messages.VAL_4001
      });
    }

    try {
      validateField(firstName, nameRegex, Codes.REG_1003, `${Messages.REG_1003}: ${firstName}`);
      validateField(lastName, nameRegex, Codes.REG_1003, `${Messages.REG_1003}: ${lastName}`);
      validateField(password, passwordRegex, Codes.REG_1006, Messages.REG_1006);
      validateField(phoneNumber, phoneNumberRegex, Codes.REG_1003, `${Messages.REG_1003}: ${phoneNumber}`);
      validateField(email, emailRegex, Codes.REG_1003, `${Messages.REG_1003}: ${email}`);
    } catch (validationError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: validationError.code,
        message: validationError.message
      });
    }

    try {
      await checkExistingAccount('email', email, AccountMongooseModel, Codes.REG_1005, Messages.REG_1005);
    } catch (accountError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusMessages.FAILED,
        code: accountError.code,
        message: accountError.message
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hiddenEmail = hideEmail(email);

    const newAccount = new AccountServiceModel(firstName, lastName, hashedPassword, email, phoneNumber);
    await AccountMongooseModel.create(newAccount);

    res.status(StatusCodes.CREATE).json({
      status: StatusMessages.SUCCESS,
      code: Codes.REG_1001,
      message: Messages.REG_1001,
      data: {
        firstName: newAccount.firstName,
        lastName: newAccount.lastName,
        email: hiddenEmail,
        phoneNumber: newAccount.phoneNumber,
        password: hashedPassword,
        isAdmin: isAdmin
      }
    });

  } catch (error) {
    console.error(error);
    res.status(StatusCodes.SERVER_ERROR).json(
      ResponseModel.create({
        status: StatusMessages.FAILED,
        message: StatusMessages.SERVER_ERROR,
      })
    );
  }
}
