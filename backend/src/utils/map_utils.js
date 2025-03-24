import { response } from "express";

export class MapUtils {
  static createMappedFlightDetails(
    obj,
    flag,
    airlines = [],
    airports = [],
    aircrafts = [],
    cabins = []
  ) {
    let response = []
    for (let i = 0; i < obj.length; i++) {
      let value = obj[i];
      const mappedData = new Map();
      const segment = value.itineraries?.[0]?.segments?.[0];
      const travelerPricing = value.travelerPricings?.[0];
      const fareDetails = travelerPricing?.fareDetailsBySegment?.[0];

      mappedData.set("direction", flag)
      mappedData.set("airline", segment?.carrierCode); // Rename carrierCode -> airLineCode
      mappedData.set("flightNumber", segment?.carrierCode + segment?.number);
      mappedData.set(
        "airlineName",
        airlines.find(
          (airline) =>
            airline.carrierCode == value.itineraries[0].segments[0].carrierCode
        )?.airlineName
      );
      mappedData.set("departure", {
        iataCode: segment?.departure?.iataCode,
        cityName: airports.find(
          (airport) => airport.iataCode == segment?.departure?.iataCode
        )?.cityName,
        time: segment?.departure?.at,
      });

      mappedData.set("arrival", {
        iataCode: segment?.arrival?.iataCode,
        cityName: airports.find(
          (airport) => airport.iataCode == segment?.arrival?.iataCode
        )?.cityName,
        time: segment?.arrival?.at,
      });
      mappedData.set("duration", segment?.duration);
      mappedData.set("aircraft", {
        code: segment?.aircraft?.code,
        name: aircrafts.find(
          (aircraft) => aircraft.aircraftCode == segment?.aircraft?.code
        )?.name,
        seatLayout: aircrafts.find(
          (aircraft) => aircraft.aircraftCode == segment?.aircraft?.code
        )?.seatLayout,
        seatPitch: aircrafts.find(
          (aircraft) => aircraft.aircraftCode == segment?.aircraft?.code
        )?.seatPitch,
        seatCapacity: aircrafts.find(
          (aircraft) => aircraft.aircraftCode == segment?.aircraft?.code
        )?.seatCapacity,
        seatClass: aircrafts.find(
          (aircraft) => aircraft.aircraftCode == segment?.aircraft?.code
        )?.seatClass,
      });
      mappedData.set("baggage", {
        checked: cabins.find(
          (cabin) => cabin.code == fareDetails?.cabin
        )?.checked,
        carryOn: cabins.find(
          (cabin) => cabin.code == fareDetails?.cabin
        )?.carryOn,
      });
      mappedData.set("price", {
        amount: value.price?.total,
        currency: value.price?.currency,
      });
      if(flag == "OUTBOUND") {
        response.push(Object.fromEntries(mappedData));
      } else if(flag == "INBOUND") {
        response.push(Object.fromEntries(mappedData));
      }
    }
    return response;
  }
}
