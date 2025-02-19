import mongoose from "mongoose";
import { flightDb } from "../config/connections.js";


class FlightServiceModel {
  constructor(flightNumber, origin, destination, departureTime, arrivalTime) {
    this.flightNumber = flightNumber;
    this.origin = origin;
    this.destination = destination;
    this.departureTime = departureTime;
    this.arrivalTime = arrivalTime;
  }

  static getSchema() {
    return new mongoose.Schema(
      {
        flightNumber: { type: String, required: true },
        origin: { type: String, required: true },
        destination: { type: String, required: true },
        departureTime: { type: Date, required: true },
        arrivalTime: { type: Date, required: true },
      },
      { timestamps: true }
    );
  }

  static getSchema() {
    return new mongoose.Schema(
      {
        flightNumber: { type: String, required: true },
        origin: { type: String, required: true },
        destination: { type: String, required: true },
        departureTime: { type: Date, required: true },
        arrivalTime: { type: Date, required: true },
      },
      { timestamps: true }
    );
  }

  static async getAllFlights(filterQuery = {}, skip = 0, limit = 10) {
    try {
      const total = await FlightMongooseModel.countDocuments(filterQuery);
      const flights = await FlightMongooseModel.aggregate([
        { $match: filterQuery },
        {
          $lookup: {
            from: "seats",
            localField: "_id",
            foreignField: "flightId",
            as: "seats"
          }
        },
        {
          $project: {
            flightNumber: 1,
            origin: 1,
            destination: 1,
            departureTime: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M:%S",
                date: "$departureTime",
                timezone: "Asia/Bangkok"
              }
            },
            arrivalTime: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M:%S",
                date: "$arrivalTime",
                timezone: "Asia/Bangkok"
              }
            },
            seats: 1,
            availableSeats: {
              $size: {
                $filter: {
                  input: "$seats",
                  as: "seat",
                  cond: { $eq: ["$$seat.status", "available"] }
                }
              }
            }
          }
        },
        { $skip: skip },
        { $limit: limit }
      ]);

      if (!flights || flights.length === 0) {
      }

      return { flights, total };
    } catch (error) {
      throw new Error(error.message);
    }
  }

}

const FlightMongooseModel = flightDb.model("Flight", FlightServiceModel.getSchema());

export { FlightServiceModel, FlightMongooseModel };
