import { AircraftMongooseModel } from "../models/aircraft_models.js";
import { AirlineMongooseModel } from "../models/airline_models.js";
import { AirportMongooseModel } from "../models/airport_models.js";
import { CabinClassMongooseModel } from "../models/cabin_models.js";
import { HeaderInterceptor } from "../utils/header_interceptor.js";
import { MapUtils } from "../utils/map_utils.js";
import axios from "axios";

export const postFlightsOffer = async (req, res) => {
  try {
    const airlines = await AirlineMongooseModel.find();
    const airports = await AirportMongooseModel.find();
    const domestic = airlines.map((value) => value.carrierCode).join(',')
    const aircrafts = await AircraftMongooseModel.find();
    const cabins = await CabinClassMongooseModel.find();
    let { direction } = req.body;
    if (direction === "oneWay") {
      await HeaderInterceptor.fetchToken();
      HeaderInterceptor.setConfigOffer(req.body, domestic);
      const config = HeaderInterceptor.getConfig();
      const response = await axios.request(config);

      const mappedData = MapUtils.createMappedFlightDetails(
        response.data.data,
        direction,
        airlines,
        airports,
        aircrafts,
        cabins
      );
      res.status(200).json(mappedData)
    } else if (direction === "roundTrip") {
      await HeaderInterceptor.fetchToken();
      HeaderInterceptor.setConfigOffer(req.body);
      const config = HeaderInterceptor.getConfig();
      const response = await axios.request(config);
      res.status(200).json(response.data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
