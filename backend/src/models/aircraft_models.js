import mongoose from "mongoose";
import { flightDb } from "../config/connections.js";

class AircraftServiceModel {
    constructor(aircraftCode, name, seatLayout, seatPitch, seatCapacity, updatedAt) {
        this.aircraftCode = aircraftCode;
        this.name = name;
        this.seatLayout = seatLayout;
        this.seatPitch = seatPitch;
        this.seatCapacity = seatCapacity;
        this.updatedAt = updatedAt;
    }

    static getSchema() {
        return new mongoose.Schema(
            {
                aircraftCode: {
                    type: String,
                    required: true,
                    unique: true,
                    trim: true
                },
                name: {
                    type: String,
                    required: true,
                    trim: true
                },
                seatLayout: {
                    type: String,
                    required: true,
                    trim: true
                },
                seatPitch: {
                    type: String,
                    required: true,
                    trim: true
                },
                seatCapacity: {
                    type: String,
                    required: true,
                    trim: true
                },
                updatedAt: {
                    type: Date,
                    default: Date.now
                }
            },
            { timestamps: true }
        );
    }
}

const AircraftMongooseModel = flightDb.model("Aircraft", AircraftServiceModel.getSchema());

export { AircraftServiceModel, AircraftMongooseModel };
