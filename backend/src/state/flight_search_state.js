import { HeaderInterceptor } from "../utils/header_interceptor.js";
import axios from "axios";
import { MapUtils } from "../utils/map_utils.js";
import redisClient from "../utils/redis_utils.js";
import {
  DirectFieldExpression,
  LookupExpression,
} from "../interpreter/expression.js";
import { MappingInterpreter } from "../interpreter/expression_context.js";
import { RequestConfigBuilder } from "../utils/build_pattern.js";
import logger from '../utils/logger_utils.js'

export class FlightSearchState {
  constructor() {
    this.expressions = [
      new DirectFieldExpression("direction", "flag"),
      new DirectFieldExpression(
        "flightNumber",
        "segment.carrierCode + segment.number"
      ),
      new LookupExpression(
        "departure.cityName",
        "airports",
        "segment.departure.iataCode",
        "cityName"
      ),
      new LookupExpression(
        "aircraft.name",
        "aircrafts",
        "segment.aircraft.code",
        "name"
      ),
    ];
  }
  async search(reqBody, sharedData) {
    throw new Error("search() must be implemented by subclass");
  }

}

export class OnewayState extends FlightSearchState {
  async search(reqBody, sharedData) {
    const prepUrl = HeaderInterceptor.setConfigOffer(
      reqBody,
      sharedData.domestic,
      true
    );
    const token = await HeaderInterceptor.fetchToken()
    const config = new RequestConfigBuilder("get")
      .setAuth(token)
      .setContentType("application/x-www-form-urlencoded")
      .setURL(prepUrl)
      .build();

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
    let prepUrl = HeaderInterceptor.setConfigOffer(
      reqBody,
      sharedData.domestic,
      true
    );
    const token = await HeaderInterceptor.fetchToken()
    const configOut = new RequestConfigBuilder("get")
      .setAuth(token)
      .setContentType("application/x-www-form-urlencoded")
      .setURL(prepUrl)
      .build();

    prepUrl = HeaderInterceptor.setConfigOffer(
      reqBody,
      sharedData.domestic,
      false
    );

    const configIn = new RequestConfigBuilder("get")
      .setAuth(token)
      .setContentType("application/x-www-form-urlencoded")
      .setURL(prepUrl)
      .build();

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
