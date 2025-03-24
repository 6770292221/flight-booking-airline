import mongoose from "mongoose";
import { flightDb } from "../config/connections.js";

class AirlineServiceModel {
  constructor(carrierCode, airlineName, logoUrl, country, isLowCost, updatedAt) {
    this.carrierCode = carrierCode;
    this.airlineName = airlineName;
    this.logoUrl = logoUrl;
    this.country = country;
    this.isLowCost = isLowCost;
    this.updatedAt = updatedAt;
  }

  static getSchema() {
    return new mongoose.Schema(
      {
        carrierCode: {
          type: String,
          required: true,
          unique: true,
          trim: true
        },
        airlineName: {
          type: String,
          required: true,
          trim: true
        },
        logoUrl: {
          type: String,
          required: true,
          validate: {
            validator: function (v) {
              return /^https?:\/\/.+/i.test(v);
            },
            message: 'Invalid URL format.'
          }
        },
        country: {
          type: String,
          required: true,
          trim: true
        },
        isLowCost: {
          type: Boolean,
          default: false
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

const AirlineMongooseModel = flightDb.model("airlines", AirlineServiceModel.getSchema());

export { AirlineServiceModel, AirlineMongooseModel };
