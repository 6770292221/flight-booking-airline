import { AircraftMongooseModel } from "../models/aircraft_models.js";
import { AirlineMongooseModel } from "../models/airline_models.js";
import { AirportMongooseModel } from "../models/airport_models.js";
import { CabinClassMongooseModel } from "../models/cabin_models.js";
import { HeaderInterceptor } from "../utils/header_interceptor.js";
import { MapUtils } from "../utils/map_utils.js";
import axios from "axios";
import redisClient from "../utils/redis_utils.js";

export const postFlightsOffer = async (req, res) => {
  try {
    await HeaderInterceptor.fetchToken();
    const airlines = await AirlineMongooseModel.find();
    const airports = await AirportMongooseModel.find();
    const domestic = airlines.map((value) => value.carrierCode).join(",");
    const aircrafts = await AircraftMongooseModel.find();
    const cabins = await CabinClassMongooseModel.find();
    let resp = {
      dircetion: "",
      outbound: [],
      inbound: [],
    };

    let {
      direction,
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
    } = req.body;
    let key = `${originLocationCode}:${destinationLocationCode}:${departureDate}:${adults}`;
    const expiryTime = 180;
    if (direction == "ONEWAY") {
      resp.dircetion = "ONEWAY";
      let flightCache = await redisClient.get(key);
      if (flightCache) {
        resp.outbound = JSON.parse(flightCache);
      } else {
        const config = HeaderInterceptor.setConfigOffer(
          req.body,
          domestic,
          true
        );
        const respOutbound = await axios.request(config);
        resp.outbound = MapUtils.createMappedFlightDetails(
          respOutbound.data.data,
          "OUTBOUND",
          airlines,
          airports,
          aircrafts,
          cabins
        );
        await redisClient.setEx(key, expiryTime, JSON.stringify(resp.outbound));
        console.log("set cache redis: " + key);
      }
    } else if (direction == "ROUNDTRIP") {
      resp.dircetion = "ROUNDTRIP";
      let config = HeaderInterceptor.setConfigOffer(req.body, domestic, true);
      let flightCache = await redisClient.get(key);
      if (flightCache) {
        resp.outbound = JSON.parse(flightCache);
      } else {
        const respOutbound = await axios.request(config);
        resp.outbound = MapUtils.createMappedFlightDetails(
          respOutbound.data.data,
          "OUTBOUND",
          airlines,
          airports,
          aircrafts,
          cabins
        );
        await redisClient.setEx(key, expiryTime, JSON.stringify(resp.outbound));
        console.log("set cache redis: " + key);
      }
      key = `${destinationLocationCode}:${originLocationCode}:${departureDate}:${adults}`;
      flightCache = await redisClient.get(key);
      if (flightCache) {
        resp.inbound = JSON.parse(flightCache);
      } else {
        config = HeaderInterceptor.setConfigOffer(req.body, domestic, false);
        const respInbound = await axios.request(config);
        resp.inbound = MapUtils.createMappedFlightDetails(
          respInbound.data.data,
          "INBOUND",
          airlines,
          airports,
          aircrafts,
          cabins
        );

        await redisClient.setEx(key, expiryTime, JSON.stringify(resp.outbound));
        console.log("set cache redis: " + key);
      }
    }
    res.status(200).json(resp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
