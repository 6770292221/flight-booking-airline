import axios from "axios";
import qs from "qs";

class HeaderInterceptor {
  static headerToken = "";
  static config = {};
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

  static setConfigOffer(reqBody, domestic) {
    const queryParams = qs.stringify(
      {
        adults: reqBody.adults,
        originLocationCode: reqBody.originLocationCode,
        destinationLocationCode: reqBody.destinationLocationCode,
        departureDate: reqBody.departureDate,
        nonStop: reqBody.nonStop || undefined,
        max: reqBody.max || undefined,
        currencyCode: reqBody.currencyCode || undefined,
        children: reqBody.children || undefined,
        infants: reqBody.infants || undefined,
      },
      { skipNulls: true }
    ); // This prevents adding empty params
    const includedAirlineCodesParam = domestic 
    ? `includedAirlineCodes=${domestic}`
    : '';


    HeaderInterceptor.config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://test.api.amadeus.com/v2/shopping/flight-offers?${includedAirlineCodesParam}&${queryParams}`,
      headers: {
        Authorization: "Bearer " + HeaderInterceptor.getToken(),
      },
    };
  }

  static getConfig() {
    return HeaderInterceptor.config;
  }
}

export { HeaderInterceptor };
