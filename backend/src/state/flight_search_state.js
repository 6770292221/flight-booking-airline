import { HeaderInterceptor } from "../utils/header_interceptor.js";
import axios from "axios";
import { MapUtils } from "../utils/map_utils.js";
import redisClient from "../utils/redis_utils.js";
import { DirectFieldExpression, LookupExpression } from "../interpreter/expression.js";
import {MappingInterpreter} from "../interpreter/expression_context.js"

export class FlightSearchState {
  constructor() {
     this.expressions = [
      new DirectFieldExpression("direction", "flag"),
      new DirectFieldExpression("flightNumber", "segment.carrierCode + segment.number"),
      new LookupExpression("departure.cityName", "airports", "segment.departure.iataCode", "cityName"),
      new LookupExpression("aircraft.name", "aircrafts", "segment.aircraft.code", "name"),
    ];
  }
  async search(reqBody, sharedData) {
    throw new Error("search() must be implemented by subclass");
  }

  // async getCache(key) {
  //   const result = await redisClient.get(key);
  //   return result ? JSON.parse(result) : null;
  // }

  // async setCache(key, value, ttlSeconds = 300) {
  //   await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  // }

  // buildCacheKey(reqBody, direction = OnewayState.name) {
  //   const {
  //     originLocationCode,
  //     destinationLocationCode,
  //     departureDate,
  //     adults,
  //     children,
  //     infants,
  //   } = reqBody;
  //   return direction == OnewayState.name
  //     ? `${originLocationCode}:${destinationLocationCode}:${departureDate}:${adults}:${children}:${infants}`
  //     : `${destinationLocationCode}:${originLocationCode}:${departureDate}:${adults}:${children}:${infants}`;
  // }
}

export class OnewayState extends FlightSearchState {
  async search(reqBody, sharedData) {
  
    // const cacheKey = this.buildCacheKey(reqBody, OnewayState.name);
    // const cached = await this.getCache(cacheKey);
    // if (cached) {
    //   console.log("✅ Cache hit: ONEWAY");
    //   return {
    //     direction: "ONEWAY",
    //     outbound: cached,
    //   };
    // }
    const config = HeaderInterceptor.setConfigOffer(
      reqBody,
      sharedData.domestic,
      true
    );
    const resp = await axios.request(config);

    const mapped = MapUtils.createMappedFlightDetails(
      resp.data.data,
      "OUTBOUND",
      sharedData.airlines,
      sharedData.airports,
      sharedData.aircrafts,
      sharedData.cabins
    );
    // await this.setCache(cacheKey, mapped);

    return {
      direction: "ONEWAY",
      outbound: mapped,
    };
  }
}

export class RoundtripState extends FlightSearchState {
  async search(reqBody, sharedData) {
    // const keyOut = this.buildCacheKey(reqBody, "ROUNDTRIP_OUTBOUND");
    // const keyIn = this.buildCacheKey(reqBody, "ROUNDTRIP_INBOUND");

    // const [cachedOut, cachedIn] = await Promise.all([
    //   this.getCache(keyOut),
    //   this.getCache(keyIn),
    // ]);

    // if (cachedOut && cachedIn) {
    //   console.log("✅ Cache hit: ROUNDTRIP");
    //   return {
    //     direction: "ROUNDTRIP",
    //     outbound: cachedOut,
    //     inbound: cachedIn,
    //   };
    // }

    const configOut = HeaderInterceptor.setConfigOffer(
      reqBody,
      sharedData.domestic,
      true
    );

    const configIn = HeaderInterceptor.setConfigOffer(
      reqBody,
      sharedData.domestic,
      false
    );

    const [respOut, respIn] = await Promise.all([
      axios.request(configOut),
      axios.request(configIn),
    ]);

    const mappedOut = MapUtils.createMappedFlightDetails(
      respOut.data.data,
      "OUTBOUND",
      sharedData.airlines,
      sharedData.airports,
      sharedData.aircrafts,
      sharedData.cabins
    );

    const mappedIn = MapUtils.createMappedFlightDetails(
      respIn.data.data,
      "INBOUND",
      sharedData.airlines,
      sharedData.airports,
      sharedData.aircrafts,
      sharedData.cabins
    );

    // await Promise.all([
    //   this.setCache(keyOut, mappedOut),
    //   this.setCache(keyIn, mappedIn),
    // ]);

    return {
      direction: "ROUNDTRIP",
      outbound: mappedOut,
      inbound: mappedIn,
    };
  }
}
