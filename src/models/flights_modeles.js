import mongoose from "mongoose";

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
  static async getAllFlights() {
    try {
      const flights = await FlightMongooseModel.aggregate([
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
            createdAt: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M:%S",
                date: "$createdAt",
                timezone: "Asia/Bangkok"
              }
            },
            updatedAt: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M:%S",
                date: "$updatedAt",
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
        }
      ]);

      return flights;

    } catch (error) {
      throw new Error("Error fetching flights: " + error.message);
    }
  }
}

const FlightMongooseModel = mongoose.model("Flight", FlightServiceModel.getSchema());

export { FlightServiceModel, FlightMongooseModel };
