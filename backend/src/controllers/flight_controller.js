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
    let resp = {
      dircetion: '',
      outbound: [],
      inbound: []
    };
    let { direction } = req.body;
      if( direction == "ONEWAY" ) {
        resp.dircetion = "ONEWAY"
        await HeaderInterceptor.fetchToken();
        HeaderInterceptor.setConfigOffer(req.body, domestic, true);
        const respOutbound = await axios.request(HeaderInterceptor.getConfig());
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
        await HeaderInterceptor.fetchToken();
        HeaderInterceptor.setConfigOffer(req.body, domestic, true);
        const config = HeaderInterceptor.getConfig();
        const respOutbound = await axios.request(HeaderInterceptor.getConfig());
        resp.outbound = MapUtils.createMappedFlightDetails(
          respOutbound.data.data,
          "OUTBOUND",
          airlines,
          airports,
          aircrafts,
          cabins
        );
        HeaderInterceptor.setConfigOffer(req.body, domestic, false);
        const respInbound = await axios.request(HeaderInterceptor.getConfig());
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
