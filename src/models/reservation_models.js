import mongoose from "mongoose";

const paymentStatusEnum = ["pending", "completed", "failed", "cancel"];

class ReservationServiceModel {
    constructor(flightId, seatId, userId, bookingReference) {
        this.flightId = flightId;
        this.seatId = seatId;
        this.userId = userId;
        this.bookingReference = bookingReference;
    }

    static getSchema() {
        return new mongoose.Schema(
            {
                flightId: { type: String, required: true },
                seatId: { type: [String], required: true },
                userId: { type: String, required: true },
                paymentStatus: {
                    type: String,
                    enum: paymentStatusEnum,
                    default: "pending",
                    required: true
                },
                bookingReference: { type: String, required: true },
            },

            { timestamps: true }
        );
    }

    static async getAllReservations() {
        try {
            const reservations = await ReservationMongooseModel.aggregate([
                {
                    $addFields: {
                        flightId: { $toObjectId: "$flightId" },
                        seatId: { $map: { input: "$seatId", as: "s", in: { $toObjectId: "$$s" } } },
                        userId: { $toObjectId: "$userId" }
                    }
                },
                {
                    $lookup: {
                        from: "flights",
                        localField: "flightId",
                        foreignField: "_id",
                        as: "flight"
                    }
                },
                { $unwind: "$flight" },

                { $unwind: "$seatId" },
                {
                    $lookup: {
                        from: "seats",
                        localField: "seatId",
                        foreignField: "_id",
                        as: "seat"
                    }
                },
                { $unwind: "$seat" },

                {
                    $lookup: {
                        from: "accounts",
                        localField: "userId",
                        foreignField: "_id",
                        as: "account"
                    }
                },
                { $unwind: "$account" },

                {
                    $group: {
                        _id: { flightId: "$flightId", userId: "$userId" },
                        flight: { $first: "$flight" },
                        seats: { $addToSet: "$seat" },
                        account: { $first: "$account" },
                        reservations: { $first: "$$ROOT" }
                    }
                },

                {
                    $project: {
                        "_id": 0,
                        "reservationId": "$reservations._id",
                        "paymentStatus": "$reservations.paymentStatus",
                        "bookingReference": "$reservations.bookingReference",
                        "createdAt": "$reservations.createdAt",
                        "flight": {
                            "flightNumber": "$flight.flightNumber",
                            "origin": "$flight.origin",
                            "destination": "$flight.destination",
                            "departureTime": "$flight.departureTime",
                            "arrivalTime": "$flight.arrivalTime"
                        },
                        "seats": {
                            "$map": {
                                "input": "$seats",
                                "as": "seat",
                                "in": {
                                    "seatNumber": "$$seat.seatNumber",
                                    "seatClass": "$$seat.seatClass",
                                    "price": "$$seat.price"
                                }
                            }
                        },
                        "account": {
                            "name": "$account.name",
                            "email": "$account.email"
                        },
                        "totalPrice": {
                            $sum: { $ifNull: ["$seats.price", 0] }
                        }
                    }
                }

            ]);
            return reservations;
        } catch (error) {
            console.error("Error fetching reservations:", error);
            throw new Error("Failed to fetch reservations");
        }
    }

    static async getReservationsByEmail(email) {
        try {
            const reservations = await ReservationMongooseModel.find({ 'account.email': email });
            return reservations;
        } catch (error) {
            throw new Error(`Error fetching reservations by email: ${error.message}`);
        }
    }
}


const ReservationMongooseModel = mongoose.model("Reservation", ReservationServiceModel.getSchema());

export { ReservationServiceModel, ReservationMongooseModel };
