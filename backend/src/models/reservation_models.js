import mongoose from "mongoose";

const statusEnum = ["pending", "completed", "failed", "cancelled"];

const passengerSchema = new mongoose.Schema({
    seatId: { type: String, required: true },
    first: { type: String, required: true },
    family: { type: String, required: true },
    passport: { type: String, required: true },
    price: { type: Number, required: true },

});

const reservationSchema = new mongoose.Schema(
    {
        flightId: { type: String, required: true },
        bookingId: { type: String, required: true },
        status: {
            type: String,
            enum: statusEnum,
            default: "pending",
            required: true,

        },
        passenger: { type: [passengerSchema], required: true },
        userId: { type: String, required: true },
        paymentReference: {
            type: String,
            enum: statusEnum,
            default: null,
            required: false,
        },
    },

    { timestamps: true }
);

class ReservationServiceModel {
    constructor() {
        this.ReservationModel = mongoose.model("Reservation", reservationSchema);
    }

    async createReservation(flightId, passenger, userId, bookingId, paymentReference) {
        try {
            const reservation = new this.ReservationModel({
                flightId,
                passenger,
                userId,
                bookingId,
                paymentReference
            });
            await reservation.save();
            return reservation;
        } catch (error) {
            console.error("Error creating reservation:", error);
            throw new Error("Failed to create reservation");
        }
    }


    //     static async getAllReservations() {
    //         try {
    //             const reservations = await ReservationMongooseModel.aggregate([
    //                 {
    //                     $addFields: {
    //                         flightId: { $toObjectId: "$flightId" },
    //                         seatId: { $map: { input: "$seatId", as: "s", in: { $toObjectId: "$$s" } } },
    //                         userId: { $toObjectId: "$userId" }
    //                     }
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: "flights",
    //                         localField: "flightId",
    //                         foreignField: "_id",
    //                         as: "flight"
    //                     }
    //                 },
    //                 { $unwind: "$flight" },

    //                 { $unwind: "$seatId" },
    //                 {
    //                     $lookup: {
    //                         from: "seats",
    //                         localField: "seatId",
    //                         foreignField: "_id",
    //                         as: "seat"
    //                     }
    //                 },
    //                 { $unwind: "$seat" },

    //                 {
    //                     $lookup: {
    //                         from: "accounts",
    //                         localField: "userId",
    //                         foreignField: "_id",
    //                         as: "account"
    //                     }
    //                 },
    //                 { $unwind: "$account" },

    //                 {
    //                     $group: {
    //                         _id: { flightId: "$flightId", userId: "$userId" },
    //                         flight: { $first: "$flight" },
    //                         seats: { $addToSet: "$seat" },
    //                         account: { $first: "$account" },
    //                         reservations: { $first: "$$ROOT" }
    //                     }
    //                 },

    //                 {
    //                     $project: {
    //                         "_id": 0,
    //                         "reservationId": "$reservations._id",
    //                         "paymentStatus": "$reservations.paymentStatus",
    //                         "bookingReference": "$reservations.bookingReference",
    //                         "createdAt": "$reservations.createdAt",
    //                         "flight": {
    //                             "flightNumber": "$flight.flightNumber",
    //                             "origin": "$flight.origin",
    //                             "destination": "$flight.destination",
    //                             "departureTime": "$flight.departureTime",
    //                             "arrivalTime": "$flight.arrivalTime"
    //                         },
    //                         "seats": {
    //                             "$map": {
    //                                 "input": "$seats",
    //                                 "as": "seat",
    //                                 "in": {
    //                                     "seatNumber": "$$seat.seatNumber",
    //                                     "seatClass": "$$seat.seatClass",
    //                                     "price": "$$seat.price"
    //                                 }
    //                             }
    //                         },
    //                         "account": {
    //                             "name": "$account.name",
    //                             "email": "$account.email"
    //                         },
    //                         "totalPrice": {
    //                             $sum: { $ifNull: ["$seats.price", 0] }
    //                         }
    //                     }
    //                 }

    //             ]);
    //             return reservations;
    //         } catch (error) {
    //             console.error("Error fetching reservations:", error);
    //             throw new Error("Failed to fetch reservations");
    //         }
    //     }

    //     static async getReservationsByEmail(email) {
    //         try {
    //             const reservations = await ReservationMongooseModel.find({ 'account.email': email });
    //             return reservations;
    //         } catch (error) {
    //             throw new Error(`Error fetching reservations by email: ${error.message}`);
    //         }
    //     }
}

const ReservationMongooseModel = mongoose.model("Reservation", reservationSchema);
export { ReservationServiceModel, ReservationMongooseModel };
