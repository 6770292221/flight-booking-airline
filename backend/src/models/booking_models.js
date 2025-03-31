import mongoose from "mongoose";
import { bookingDb } from "../config/connections.js";

const flightSchema = new mongoose.Schema({
    direction: String,
    flightNumber: String,
    airline: String,
    airlineName: String,
    departure: {
        iataCode: String,
        cityName: String,
        time: Date
    },
    arrival: {
        iataCode: String,
        cityName: String,
        time: Date
    },
    price: {
        amount: String,
        currency: String
    }
}, { _id: false });

const passengerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    type: String,
    nationality: String,
    passportNumber: String,
    passportExpiryDate: Date,
    dateOfBirth: Date,
    gender: String,
    tickets: [{
        flightNumber: String,
        ticketNumber: String
    }],
    addons: [{
        flightNumber: String,
        seat: String,
        meal: String,
        price: {
            amount: String,
            currency: String
        }
    }]
}, { _id: false });


const bookingSchema = new mongoose.Schema({
    bookingNubmer: {
        type: String,
        unique: true,
        required: true,
        default: () => `BK${Date.now()}`
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flights: [flightSchema],
    passengers: [passengerSchema],
    status: { type: String, default: "PENDING" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 60 * 1000)
    },
    events: [
        {
            type: { type: String, required: true },
            status: { type: String, enum: ["SUCCESS", "FAILED", "PENDING"], required: true },
            source: { type: String, enum: ["SYSTEM", "USER", "WEBHOOK"], required: true },
            message: { type: String },
            payload: { type: mongoose.Schema.Types.Mixed },
            createdAt: { type: Date, default: Date.now }
        }
    ]
});
const BookingMongooseModel = bookingDb.model("Booking", bookingSchema);
export { BookingMongooseModel };
