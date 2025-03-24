import axios from "axios";
import qs from "qs";

class HeaderInterceptor {
  constructor() {}
  static headerToken = "";
  static async fetchToken() {
    const data = qs.stringify({
      grant_type: "client_credentials",
      client_id: "emDc3AJZIDpiGzbP4sUC8GeXdpiWaN0R",
      client_secret: "yOJRWrCoV8DIucIq",
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://test.api.amadeus.com/v1/security/oauth2/token?",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      console.log("Token fetched:", response.data);
      HeaderInterceptor.headerToken = response.data.access_token;
    } catch (error) {
      console.error("Error fetching token:", error);
      throw new Error("Failed to fetch token");
    }
  }

  static getToken() {
    return HeaderInterceptor.headerToken;
  }

  static setConfigGet() {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: ``,
      headers: {
        Authorization: "Bearer " + HeaderInterceptor.getToken(),
      },
    };
    return config;
  }

  static setConfigOffer(reqBody, domestic, direction) {
    let config = HeaderInterceptor.setConfigGet();
    const queryParams = qs.stringify(
      {
        adults: reqBody.adults,
        originLocationCode: direction
          ? reqBody.originLocationCode
          : reqBody.destinationLocationCode,
        destinationLocationCode: direction
          ? reqBody.destinationLocationCode
          : reqBody.originLocationCode,
        departureDate: direction ? reqBody.departureDate : reqBody.arrivalDate,
        nonStop: reqBody.nonStop || undefined,
        max: reqBody.max || undefined,
        currencyCode: reqBody.currencyCode || "THB",
        children: reqBody.children || undefined,
        infants: reqBody.infants || undefined,
      },
      { skipNulls: true }
    ); // This prevents adding empty params
    const includedAirlineCodesParam = domestic
      ? `includedAirlineCodes=${domestic}`
      : "";

    config.url = `https://test.api.amadeus.com/v2/shopping/flight-offers?${includedAirlineCodesParam}&${queryParams}`  
    return config;
  }
}



export { HeaderInterceptor };
