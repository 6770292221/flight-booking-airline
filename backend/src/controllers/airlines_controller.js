import { AirlineMongooseModel } from "../models/airline_models.js";
import {
  Codes,
  StatusCodes,
  StatusMessages,
  Messages,
} from "../enums/enums.js";

export async function getAirlines(req, res) {
  try {
    const { page = 1, limit = 10, isLowCost } = req.query;

    const query = {};
    if (isLowCost !== undefined) {
      query.isLowCost = isLowCost === "true";
    }

    const airlines = await AirlineMongooseModel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 });

    const totalAirlines = await AirlineMongooseModel.countDocuments(query);

    return res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.AIR_1004,
      message: Messages.AIR_1004,
      data: {
        items: airlines,
        pagination: {
          total: totalAirlines,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalAirlines / limit),
        },
      },
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: Codes.GNR_1001,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function getAirlineById(req, res) {
  try {
    const { id } = req.params;

    const airline = await AirlineMongooseModel.findById(id);

    if (!airline) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: {
          status: StatusMessages.FAILED,
          code: Codes.AIR_1005,
          message: Messages.AIR_1005,
        },
      });
    }

    res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.AIR_1004,
      message: Messages.AIR_1004,
      data: airline,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: Codes.GNR_1001,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function createAirline(req, res) {
  try {
    const { carrierCode, airlineName, logoUrl, country, isLowCost } = req.body;

    if (!carrierCode || !airlineName || !logoUrl || !country) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          statusCode: StatusCodes.BAD_REQUEST,
          code: Codes.AIR_1002,
          message: Messages.AIR_1002,
        },
      });
    }

    const existingAirline = await AirlineMongooseModel.findOne({ carrierCode });
    if (existingAirline) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          status: StatusMessages.FAILED,
          code: Codes.AIR_1003,
          message: Messages.AIR_1003,
        },
      });
    }

    const newAirline = new AirlineMongooseModel({
      carrierCode,
      airlineName,
      logoUrl,
      country,
      isLowCost: isLowCost || false,
    });

    const validationError = newAirline.validateSync();
    if (validationError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          statusCode: StatusCodes.BAD_REQUEST,
          code: Codes.VAL_4004,
          message: Messages.VAL_4004,
        },
        data: null,
      });
    }

    await newAirline.save();

    return res.status(StatusCodes.CREATE).json({
      status: StatusMessages.SUCCESS,
      code: Codes.AIR_1001,
      message: Messages.AIR_1001,
      data: newAirline,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: Codes.GNR_1001,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function updateAirline(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedAirline = await AirlineMongooseModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAirline) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          statusCode: StatusCodes.NOT_FOUND,
          code: Codes.AIR_1005,
          message: Messages.AIR_1005,
        },
      });
    }

    res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.AIR_1006,
      message: Messages.AIR_1006,
      data: updatedAirline,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: Codes.GNR_1001,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function deleteAirline(req, res) {
  try {
    const { id } = req.params;

    const deletedAirline = await AirlineMongooseModel.findByIdAndDelete(id);

    if (!deletedAirline) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          status: StatusMessages.FAILED,
          code: Codes.AIR_1005,
          message: Messages.AIR_1005,
        },
      });
    }

    res.status(StatusCodes.OK).json({
      status: StatusMessages.SUCCESS,
      code: Codes.AIR_1007,
      message: Messages.AIR_1007,
      error: null,
      data: deletedAirline,
    });
  } catch (error) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: Codes.GNR_1001,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}

export async function issueTicketing(req, res) {
  try {
    const { airlineId, bookingId } = req.body;
    //Thai air asia
    if (airlineId == "VZ") {
      return res.status(StatusCodes.OK).json({
        status: StatusMessages.SUCCESS,
        code: Codes.TKT_1003,
        message: Messages.TKT_1003,
      });
      //Nok air
    } else if (airlineId == "FD") {
      return res.status(StatusCodes.OK).json({
        status: StatusMessages.SUCCESS,
        code: Codes.TKT_1003,
        message: Messages.TKT_1003,
      });
      //Thai lion air
    } else if (airlineId == "SL") {
      return res.status(StatusCodes.OK).json({
        status: StatusMessages.SUCCESS,
        code: Codes.TKT_1003,
        message: Messages.TKT_1003,
      });
      //Thai vietjet
    } else if (airlineId == "VZ") {
      return res.status(StatusCodes.OK).json({
        status: StatusMessages.SUCCESS,
        code: Codes.TKT_1004,
        message: Messages.TKT_1004,
      });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          statusCode: StatusCodes.BAD_REQUEST,
          code: Codes.AIR_1002,
          message: "Not found airlines",
        },
      });
    }
  } catch (err) {
    return res.status(StatusCodes.SERVER_ERROR).json({
      status: StatusMessages.FAILED,
      code: Codes.GNR_1001,
      message: StatusMessages.SERVER_ERROR,
    });
  }
}
