import { AircraftMongooseModel } from "../models/aircraft_models.js";
import { AirlineMongooseModel } from "../models/airline_models.js";
import { AirportMongooseModel } from "../models/airport_models.js";
import { CabinClassMongooseModel } from "../models/cabin_models.js";
import { HeaderInterceptor } from "../utils/header_interceptor.js";
import { MapUtils } from "../utils/map_utils.js";
import { FlightSearchContext } from "../state/flight_search_context.js"
import { OnewayState, RoundtripState } from "../state/flight_search_state.js"
import axios from "axios";

export const postFlightsOffer = async (req, res) => {
  try {
    await HeaderInterceptor.fetchToken();
    const airlines = await AirlineMongooseModel.find();
    const airports = await AirportMongooseModel.find();
    const domestic = airlines.map((value) => value.carrierCode).join(',')
    const aircrafts = await AircraftMongooseModel.find();
    const cabins = await CabinClassMongooseModel.find();
    const context = new FlightSearchContext();

    switch (req.body.direction) {
      case "ONEWAY":
        context.setState(new OnewayState());
        break;
      case "ROUNDTRIP":
        context.setState(new RoundtripState());
        break;
      default:
        return res.status(400).json({ error: "Invalid direction" });
    }

    const response = await context.search(req.body, {
      airlines,
      airports,
      aircrafts,
      cabins,
      domestic
    });

    res.status(200).json(response)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
