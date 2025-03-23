import { BookingMongooseModel } from "../models/booking_models.js";
import { StatusCodes, StatusMessages, Codes, Messages } from "../enums/enums.js";
import mongoose from "mongoose";

export async function createBooking(req, res) {
    try {

        const userId = req.user.userId;

        if (!req.user || !req.user.userId) {
            console.log("Unauthorized access. req.user is missing");
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001,
            });
        }

        const bookingData = req.body;
        console.log("Raw bookingData:", bookingData);

        if (!bookingData.bookingId) {
            const timestamp = Date.now();
            bookingData.bookingId = `BK${timestamp}`;
        }

        bookingData.userId = userId;
        bookingData.createdAt = new Date();
        bookingData.updatedAt = new Date();

        console.log("Processed bookingData:", bookingData);

        const newBooking = new BookingMongooseModel(bookingData);
        console.log("newBooking (before validate):", newBooking);

        const validationError = newBooking.validateSync();
        if (validationError) {
            console.error("Validation error:", validationError.message);
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                message: validationError.message
            });
        }

        try {
            await newBooking.save();
            console.log("Booking saved successfully");
        } catch (saveError) {
            console.error("Error during save:", saveError);
            return res.status(StatusCodes.SERVER_ERROR).json({
                status: StatusMessages.FAILED,
                message: saveError.message
            });
        }

        return res.status(StatusCodes.CREATE).json({
            status: StatusMessages.SUCCESS,
            code: Codes.BKG_1001,
            message: Messages.BKG_1001,
            data: newBooking
        });

    } catch (error) {
        console.error("createBooking error (outer):", error);
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function getBookingById(req, res) {
    try {
        const { _id } = req.params;
        const booking = await BookingMongooseModel.findById(_id);

        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.BKG_1002,
                message: Messages.BKG_1002
            });
        }

        res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.BKG_1003,
            message: Messages.BKG_1003,
            data: booking
        });
    } catch (error) {
        res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
        });
    }
}

export async function deleteBooking(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            console.log("Unauthorized access. req.user is missing:", req.user);
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001
            });
        }

        const userId = req.user.userId;
        const bookingId = req.params._id;

        console.log("userId:", userId);
        console.log("bookingId:", bookingId);

        const booking = await BookingMongooseModel.findById(bookingId);

        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.BKG_1002,
                message: Messages.BKG_1002
            });
        }

        const isOwner = booking.userId.toString() === userId.toString();
        const isAdmin = req.user.isAdmin === true;

        if (!isOwner && !isAdmin) {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: StatusMessages.FAILED,
                message: "You do not have permission to delete this booking."
            });
        }

        await booking.deleteOne();

        console.log("Booking deleted successfully!");
        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.BKG_1008,
            message: "Booking deleted successfully.",
            data: {
                deletedId: bookingId
            }
        });

    } catch (error) {
        console.error("deleteBooking error:", error);
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: StatusMessages.SERVER_ERROR,
            error: error.message
        });
    }
}

export async function updateBooking(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                code: Codes.TKN_6001,
                message: Messages.TKN_6001
            });
        }

        const userId = req.user.userId;
        const bookingId = req.params._id;
        const updateData = req.body;

        const booking = await BookingMongooseModel.findById(bookingId);

        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.BKG_1002,
                message: Messages.BKG_1002
            });
        }

        const isOwner = booking.userId.toString() === userId.toString();
        const isAdmin = req.user.isAdmin === true;

        if (!isOwner && !isAdmin) {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: StatusMessages.FAILED,
                message: "You do not have permission to update this booking."
            });
        }

        const allowedFields = [
            "flights",
            "passengers",
            "payments",
            "status",
            "amount",
            "currency"
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                booking[field] = updateData[field];
            }
        });

        booking.updatedAt = new Date();

        const validationError = booking.validateSync();
        if (validationError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                message: validationError.message
            });
        }

        await booking.save();

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.BKG_1007,
            message: "Booking updated successfully.",
            data: booking
        });

    } catch (error) {
        console.error("updateBookingAll error:", error);
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: error.message || StatusMessages.SERVER_ERROR
        });
    }
}

export async function updateTickets(req, res) {
    try {
        const bookingId = req.params._id;
        const { passengers } = req.body;

        if (!passengers || !Array.isArray(passengers)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                message: "Passengers array is required.",
            });
        }

        const booking = await BookingMongooseModel.findById(bookingId);

        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.BKG_1002,
                message: "Booking not found.",
            });
        }

        for (let i = 0; i < passengers.length; i++) {
            const updatedPassenger = passengers[i];

            const existingPassenger = booking.passengers.find(
                (p) => p.passportNumber === updatedPassenger.passportNumber
            );

            if (!existingPassenger) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    status: StatusMessages.FAILED,
                    code: Codes.BKG_1010,
                    message: `Passenger at index ${i} with passportNumber '${updatedPassenger.passportNumber}' not found in booking.`,
                });
            }

            if (updatedPassenger.tickets && Array.isArray(updatedPassenger.tickets)) {
                updatedPassenger.tickets.forEach((newTicket) => {
                    const isDuplicate = existingPassenger.tickets.some(
                        (existingTicket) =>
                            existingTicket.flightNumber === newTicket.flightNumber &&
                            existingTicket.ticketNumber === newTicket.ticketNumber
                    );

                    if (!isDuplicate) {
                        existingPassenger.tickets.push(newTicket);
                    }
                });
            }
        }

        booking.updatedAt = new Date();

        const validationError = booking.validateSync();
        if (validationError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                message: validationError.message,
            });
        }

        await booking.save();

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.BKG_1007,
            message: "Tickets updated successfully.",
            data: booking,
        });

    } catch (error) {
        console.error("updateTickets error:", error);
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: error.message || StatusMessages.SERVER_ERROR,
        });
    }
}

export async function updatePayments(req, res) {
    try {
        const bookingId = req.params._id;

        const { payments, status } = req.body;

        if (!payments || !Array.isArray(payments)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                message: "Payments array is required."
            });
        }

        const booking = await BookingMongooseModel.findById(bookingId);

        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.BKG_1002,
                message: Messages.BKG_1002
            });
        }

        booking.payments = payments;

        if (status) {
            booking.status = status;
        }

        booking.updatedAt = new Date();

        const validationError = booking.validateSync();
        if (validationError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                message: validationError.message
            });
        }

        await booking.save();

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.BKG_1007,
            message: "Payments updated successfully.",
            data: booking
        });

    } catch (error) {
        console.error("updatePayments error:", error);
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: error.message || StatusMessages.SERVER_ERROR
        });
    }
}

export async function getMyBookings(req, res) {
    try {

        const userId = req.user.userId;

        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: StatusMessages.FAILED,
                message: "Unauthorized. No userId found in token."
            });
        }

        const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);

        if (!isValidObjectId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusMessages.FAILED,
                message: "Invalid userId format."
            });
        }

        const objectIdUser = new mongoose.Types.ObjectId(userId);

        let bookings = [];
        try {
            bookings = await BookingMongooseModel.find({ userId: objectIdUser })
                .sort({ createdAt: -1 })
                .lean();

        } catch (queryError) {
            return res.status(StatusCodes.SERVER_ERROR).json({
                status: StatusMessages.FAILED,
                message: queryError.message
            });
        }

        if (!bookings || bookings.length === 0) {
            console.warn("⚠️ No bookings found for userId:", userId);
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.BKG_1002,
                message: "No bookings found"
            });
        }

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.BKG_1003,
            message: "Bookings fetched successfully.",
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: error.message || "server_error"
        });
    }
}

export async function getAllBookingsByAdmin(req, res) {
    try {
        const isAdmin = req.user.isAdmin === true;

        console.log("isAdmin:", isAdmin);

        if (!isAdmin) {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: StatusMessages.FAILED,
                message: "You do not have permission to access all bookings."
            });
        }

        let bookings = [];
        try {
            bookings = await BookingMongooseModel.find({})
                .sort({ createdAt: -1 })
                .lean();

        } catch (queryError) {
            return res.status(StatusCodes.SERVER_ERROR).json({
                status: StatusMessages.FAILED,
                message: queryError.message
            });
        }

        if (!bookings || bookings.length === 0) {
            console.warn("⚠️ No bookings found (admin)");
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusMessages.FAILED,
                code: Codes.BKG_1002,
                message: "No bookings found"
            });
        }

        return res.status(StatusCodes.OK).json({
            status: StatusMessages.SUCCESS,
            code: Codes.BKG_1003,
            message: "All bookings fetched successfully (admin).",
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        return res.status(StatusCodes.SERVER_ERROR).json({
            status: StatusMessages.FAILED,
            message: error.message || "server_error"
        });
    }
}
