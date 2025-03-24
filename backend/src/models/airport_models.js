import mongoose from "mongoose";
import { flightDb } from "../config/connections.js";

class AirportServiceModel {
    constructor(iataCode, cityName, airportName, country, timezone, updatedAt) {
        this.iataCode = iataCode;
        this.cityName = cityName;
        this.airportName = airportName;
        this.country = country;
        this.timezone = timezone;
        this.updatedAt = updatedAt;
    }

    static getSchema() {
        return new mongoose.Schema(
            {
                iataCode: {
                    type: String,
                    required: true,
                    unique: true,
                    trim: true
                },
                cityName: {
                    type: String,
                    required: true,
                    trim: true
                },
                airportName: {
                    type: String,
                    required: true,
                    trim: true
                },
                country: {
                    type: String,
                    required: true,
                    trim: true
                },
                timezone: {
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

const AirportMongooseModel = flightDb.model("Airport", AirportServiceModel.getSchema());

export { AirportServiceModel, AirportMongooseModel };
