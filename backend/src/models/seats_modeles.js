import mongoose from "mongoose";
import { flightDb } from "../config/connections.js";


const seatStatusEnum = ["available", "reserve", "confirmed"];

class SeatServiceModel {
    constructor(flightId, seatNumber, seatClass, isAvailable, price) {
        this.flightId = flightId;
        this.seatNumber = seatNumber;
        this.seatClass = seatClass;
        this.isAvailable = isAvailable;
        this.price = price;
    }

    static getSchema() {
        return new mongoose.Schema(
            {
                flightId: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", required: true },
                seatNumber: { type: String, required: true },
                seatClass: { type: String, required: true, enum: ["Economy", "Business", "First"] },
                status: {
                    type: String,
                    enum: seatStatusEnum,
                    default: "available",
                    required: true
                }, price: { type: Number, required: true, min: 0 }
            },
            { timestamps: true }
        );
    }
}

const SeatMongooseModel = flightDb.model("Seat", SeatServiceModel.getSchema());

export { SeatServiceModel, SeatMongooseModel };