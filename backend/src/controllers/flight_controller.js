import { AircraftMongooseModel } from "../models/aircraft_models.js";
import { AirlineMongooseModel } from "../models/airline_models.js";
import { AirportMongooseModel } from "../models/airport_models.js";
import { CabinClassMongooseModel } from "../models/cabin_models.js";
import { HeaderInterceptor } from "../utils/header_interceptor.js";
import { MapUtils } from "../utils/map_utils.js";
import axios from "axios";

export const postFlightsOffer = async (req, res) => {
  try {
    await HeaderInterceptor.fetchToken();
    const airlines = await AirlineMongooseModel.find();
    const airports = await AirportMongooseModel.find();
    const domestic = airlines.map((value) => value.carrierCode).join(',')
    const aircrafts = await AircraftMongooseModel.find();
    const cabins = await CabinClassMongooseModel.find();
    let resp = {
      dircetion: '',
      outbound: [],
      inbound: []
    };

    let { direction } = req.body;
      if( direction == "ONEWAY" ) {
        resp.dircetion = "ONEWAY"

        const config = HeaderInterceptor.setConfigOffer(req.body, domestic, true);
        const respOutbound = await axios.request(config);
        resp.outbound = MapUtils.createMappedFlightDetails(
          respOutbound.data.data,
          "OUTBOUND",
          airlines,
          airports,
          aircrafts,
          cabins
        );
      } else if (direction == "ROUNDTRIP") {
        resp.dircetion = "ROUNDTRIP"
        let config =  HeaderInterceptor.setConfigOffer(req.body, domestic, true);

        const respOutbound = await axios.request(config);
        resp.outbound = MapUtils.createMappedFlightDetails(
          respOutbound.data.data,
          "OUTBOUND",
          airlines,
          airports,
          aircrafts,
          cabins
        );
        config =  HeaderInterceptor.setConfigOffer(req.body, domestic, false);
        const respInbound = await axios.request(config);
        resp.inbound = MapUtils.createMappedFlightDetails(
          respInbound.data.data,
          "INBOUND",
          airlines,
          airports,
          aircrafts,
          cabins
        );

      }
      res.status(200).json(resp)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
