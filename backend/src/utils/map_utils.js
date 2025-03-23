export class MapUtils {
  static createMappedFlightDetails(
    obj,
    dircetion,
    airlines = [],
    airports = [],
    aircrafts = [],
    cabins = []
  ) {
    console.log(obj);
    let response = {
      dircetion: dircetion,
      data: [],
    };
    for (let i = 0; i < obj.length; i++) {
      let value = obj[i];
      const mappedData = new Map();
      const segment = value.itineraries?.[0]?.segments?.[0];
      const travelerPricing = value.travelerPricings?.[0];
      const fareDetails = travelerPricing?.fareDetailsBySegment?.[0];

      mappedData.set("airLineCode", segment?.carrierCode); // Rename carrierCode -> airLineCode
      mappedData.set("flightNumber", segment?.carrierCode + segment?.number);
      mappedData.set(
        "airLineName",
        airlines.find(
          (airline) =>
            airline.carrierCode == value.itineraries[0].segments[0].carrierCode
        )?.airlineName
      );
      mappedData.set("departure", {
        code: segment?.departure?.iataCode,
        cityName: airports.find(
          (airport) => airport.iataCode == segment?.departure?.iataCode
        )?.cityName,
        time: segment?.departure?.at,
      });

      mappedData.set("arrival", {
        code: segment?.arrival?.iataCode,
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
        rate: value.price?.total,
        currency: value.price?.currency,
      });
      //   console.log(mappedData)
      response.data.push(Object.fromEntries(mappedData));
    }
    return response;
  }
}
